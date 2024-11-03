import { exec } from "node:child_process";
import fs, { promises as fsPromises } from "node:fs";
import path from "node:path";
import util from "node:util";
import { TEMP_DIR } from "~/utils/constants";
import { logger } from "~/utils/logger";

const execPromise = util.promisify(exec);

const fixPythonSpacing = (filePath: string) => {
	logger.debug(`Fixing Python spacing for file: ${filePath}`);
	let content = fs.readFileSync(filePath, "utf-8");

	// Add shebang if not present
	if (!content.startsWith("#!/usr/bin/env python")) {
		content = `#!/usr/bin/env python\n${content}`;
	}

	// Fix spaces before parentheses
	content = content.replace(/(\w+)\s+\(/g, "$1(");

	// Correct indentation
	const lines = content.split("\n");
	let indentLevel = 0;
	const indentSize = 4;

	for (let i = 0; i < lines.length; i++) {
		const line = lines[i].trim();

		// Decrease indent for lines starting with 'else:', 'elif:', 'except:', etc.
		if (/^(else|elif|except|finally):/.test(line)) {
			indentLevel = Math.max(0, indentLevel - 1);
		}

		// Set the correct indentation
		lines[i] = " ".repeat(indentLevel * indentSize) + line;

		// Increase indent for lines ending with ':' (start of a new block)
		if (line.endsWith(":")) {
			indentLevel++;
		}

		// Decrease indent for 'return', 'break', 'continue', etc.
		if (/^(return|break|continue|pass)/.test(line)) {
			indentLevel = Math.max(0, indentLevel - 1);
		}
	}

	const fixedContent = lines.join("\n");
	fs.writeFileSync(filePath, fixedContent);
	logger.debug(`Python spacing fixed for file: ${filePath}`);
};

const checkPythonSyntax = async (filePath: string): Promise<void> => {
	logger.debug(`Checking Python syntax for file: ${filePath}`);
	try {
		await execPromise(`python -m py_compile ${filePath}`, { timeout: 10000 });
		logger.debug(`Python syntax check passed for file: ${filePath}`);
	} catch (error) {
		logger.error(`Python syntax check failed: ${(error as Error).message}`);
		throw new Error(`Syntax Error: ${(error as Error).message}`);
	}
};

export const runDockerContainer = async (fileName: string): Promise<string> => {
	const filePath = path.join(TEMP_DIR, fileName);
	logger.docker(`Preparing to run Docker container for file: ${fileName}`);

	try {
		// Verify the file exists
		if (!fs.existsSync(filePath)) {
			throw new Error(`File not found at ${filePath}`);
		}
		logger.debug(`File exists at ${filePath}`);

		// Apply Python code formatting and syntax check
		fixPythonSpacing(filePath);
		await checkPythonSyntax(filePath);

		// Execute the Python script in the running container
		const command = `docker compose exec -T python-runner python /code/${fileName}`;
		const timeout = 60 * 1000; // 60 seconds

		logger.debug(`Running command: ${command}`);
		const { stdout: executeResult } = await execPromise(command, { timeout });
		logger.success(`Script execution completed successfully for ${fileName}`);

		return executeResult.trim();
	} finally {
		try {
			// Delete the temporary local Python file
			await fsPromises.unlink(filePath);
			logger.delete(`Python file deleted: ${filePath}`);

			// Remove the __pycache__ directory if it exists
			const pycacheDir = path.join(path.dirname(filePath), "__pycache__");
			if (
				await fsPromises
					.access(pycacheDir)
					.then(() => true)
					.catch(() => false)
			) {
				await fsPromises.rm(pycacheDir, { recursive: true, force: true });
				logger.delete(`__pycache__ directory removed: ${pycacheDir}`);
			}
		} catch (cleanupError) {
			logger.error(`Cleanup error: ${cleanupError}`);
		}
	}
};

/**
 * Ensures Docker service is initialized and running.
 * This should be called once when your application starts.
 */
export const initializeDockerService = async (): Promise<void> => {
	try {
		// Ensure temp directory exists
		if (!fs.existsSync(TEMP_DIR)) {
			fs.mkdirSync(TEMP_DIR, { recursive: true });
		}

		// Check if Docker is running
		try {
			await execPromise("docker info", { timeout: 5000 });
		} catch (error) {
			throw new Error(
				"Docker daemon is not running. Please start Docker first.",
			);
		}

		// Check if container is already running
		const { stdout } = await execPromise("docker compose ps -q");
		if (!stdout.trim()) {
			logger.docker("Starting Docker Compose service...");
			await execPromise("docker compose up -d", { timeout: 30000 });
			logger.success("Docker Compose service started successfully");
		} else {
			logger.docker("Docker Compose service is already running");
		}
	} catch (error) {
		logger.error(
			`Failed to initialize Docker service: ${(error as Error).message}`,
		);
		throw error;
	}
};

/**
 * Stops and cleans up the Docker service.
 * Call this when shutting down your application.
 */
export const cleanupDockerService = async (): Promise<void> => {
	try {
		logger.docker("Stopping Docker Compose service...");

		// Force stop and remove containers
		await execPromise("docker compose down -v --remove-orphans", {
			timeout: 30000,
		});

		logger.success("Docker Compose service stopped successfully");

		// Optional: Clean up temp directory
		try {
			await fsPromises.rm(TEMP_DIR, { recursive: true, force: true });
			logger.delete("Temp directory cleaned up");
		} catch (error) {
			logger.warning(`Failed to clean temp directory: ${error}`);
		}
	} catch (error) {
		logger.error(`Failed to stop Docker service: ${error}`);
		throw error;
	}
};

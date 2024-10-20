import { exec } from "node:child_process";
import fs, { promises as fsPromises } from "node:fs";
import path from "node:path";
import util from "node:util";
import { tempDir } from "../utils/fileSystem";
import { logger } from "../utils/logger";

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
	const filePath = path.join(tempDir, fileName);
	logger.docker(`Preparing to run Docker container for file: ${fileName}`);

	try {
		fixPythonSpacing(filePath);
		await checkPythonSyntax(filePath);
		// Check if Docker is running
		try {
			logger.docker("Docker is running, proceeding with container execution");
			await execPromise("docker info", { timeout: 5000 });
		} catch {
			throw new Error(
				"Docker is not running. Please start Docker and try again.",
			);
		}

		const containerName = `python-script-runner-${Date.now()}`;
		const command = `docker run --name ${containerName} --rm -v ${tempDir}:/code python-black-runner /code/${fileName}`;
		const timeout = 60 * 1000; // 60 seconds

		logger.docker(`Starting Docker container: ${containerName}`);
		logger.debug(`Running command: ${command}`);

		const { stdout: executeResult } = await execPromise(command, { timeout });

		logger.success(`Docker execution completed successfully for ${fileName}`);
		return executeResult.trim();
	} finally {
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
	}
};

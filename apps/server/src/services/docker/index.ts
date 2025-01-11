import { exec } from "node:child_process";
import util from "node:util";
import { logger } from "~/utils/logger";
import type { SupportedLanguage } from "~shared/constants";
import { DOCKER_CONFIG } from "./config";
import { getLanguageHandler } from "./handlers";

const execPromise = util.promisify(exec);

interface ExecutionResult {
	success: boolean;
	output: string;
}

const formatError = (errorText: string): string => {
	// Split into lines and filter out empty lines
	const lines = errorText.split("\n").filter((line) => line.trim());

	// Extract only the important error messages
	const relevantLines = lines
		.filter((line) => {
			// Keep only error lines and their code context (lines with '|')
			return (
				line.includes(": error:") ||
				line.includes("|") ||
				line.includes("In function")
			);
		})
		.filter((line) => !line.includes("In file included from")); // Remove header inclusion traces

	// Format the error messages
	const formattedLines = relevantLines.map((line) => {
		// Clean up the line
		return line
			.replace(/^[^:]+:/, "") // Remove file name prefix
			.replace(/\/tmp\/temp_[^/]+\//, "") // Remove temp directory paths
			.trim();
	});

	return formattedLines.join("\n");
};

const buildDockerExecCommand = (serviceName: string, command: string) => {
	const baseCommand = `docker compose exec -T ${serviceName} sh -c '${command}'`;
	return process.platform === "win32"
		? `powershell -Command "& {${baseCommand}}"`
		: baseCommand;
};

export const runContainer = async (
	code: string,
	language: SupportedLanguage,
): Promise<ExecutionResult> => {
	const executionId = `${language}_${Date.now()}`;
	const handler = getLanguageHandler(language);

	try {
		// 1. Prepare the code
		const encodedCode = Buffer.from(code).toString("base64");
		logger.docker(`Preparing to execute code [ID: ${executionId}]`);

		// 2. Build the command
		const dockerCommand = handler.buildCommand(encodedCode, executionId);
		const fullCommand = buildDockerExecCommand(
			handler.getServiceName(),
			dockerCommand,
		);

		// 3. Execute the command
		logger.docker(`Running code in container [ID: ${executionId}]`);
		const { stdout, stderr } = await execPromise(fullCommand, {
			timeout: DOCKER_CONFIG.EXECUTION.TIMEOUT,
		});

		// 4. Check for errors (stderr)
		if (stderr) {
			const formattedError = formatError(stderr);
			logger.error(`Execution failed [ID: ${executionId}]:\n${formattedError}`);
			return {
				success: false,
				output: formattedError,
			};
		}

		// 5. Return successful output
		const output =
			stdout.trim() || "Program executed successfully with no output.";
		logger.success(
			`Code executed successfully [ID: ${executionId}]:\n${output}`,
		);
		return {
			success: true,
			output,
		};
	} catch (error) {
		// 6. Handle any errors
		const errorMessage = error instanceof Error ? error.message : String(error);
		logger.error(
			`Failed to execute code [ID: ${executionId}]: ${errorMessage}`,
		);
		throw error; // Re-throw the error to be handled by the caller
	}
};

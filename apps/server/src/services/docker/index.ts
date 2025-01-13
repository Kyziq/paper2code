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

const formatError = (
	errorText: string,
	language: SupportedLanguage,
): string => {
	// Split into lines and filter out empty lines
	const lines = errorText.split("\n").filter((line) => line.trim());

	if (language === "cpp") {
		// For C++, focus on the actual error messages
		const relevantLines = lines.filter((line) => {
			return (
				line.includes(": error:") ||
				line.includes(": warning:") ||
				line.includes("undefined reference to") ||
				(line.includes("|") && !line.includes("In file included from"))
			);
		});

		if (relevantLines.length === 0) {
			// If no specific error messages found, return the original error
			return errorText.trim();
		}

		// Format each error line to be more readable
		return relevantLines
			.map((line) => {
				// Remove file path prefix
				const cleanedLine = line
					.replace(/^[^:]+:/, "")
					.replace(/\/tmp\/temp_[^/]+\//, "");
				// Extract line number and error message
				const match = cleanedLine.match(/(\d+):(\d+:)?\s*(.+)/);
				if (match) {
					const [, lineNum, , message] = match;
					return `Line ${lineNum}: ${message.trim()}`;
				}
				return cleanedLine.trim();
			})
			.join("\n");
	}

	if (language === "python") {
		// For Python, keep traceback and error message
		const relevantLines = lines.filter(
			(line) =>
				line.includes("Traceback") ||
				line.includes("File") ||
				line.includes("Error:") ||
				line.includes("Exception:") ||
				/^ {4}.*$/.test(line), // Keep indented code lines
		);
		return relevantLines.join("\n");
	}

	if (language === "java") {
		// For Java, focus on compilation and runtime errors
		const relevantLines = lines.filter(
			(line) =>
				line.includes("error:") ||
				line.includes("Exception in thread") ||
				line.includes("at ") ||
				line.includes("symbol:") ||
				line.includes("location:"),
		);

		if (relevantLines.length === 0) {
			return errorText.trim();
		}

		return relevantLines
			.map((line) => {
				// Remove file path prefix for compilation errors
				return line
					.replace(/^[^:]+:/, "")
					.replace(/\/tmp\/temp_[^/]+\//, "")
					.trim();
			})
			.join("\n");
	}

	return errorText.trim();
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

		// 4. Handle compilation errors and runtime output
		if (stderr) {
			const formattedError = formatError(stderr, language);
			logger.error(`Execution failed [ID: ${executionId}]:\n${formattedError}`);
			return {
				success: false,
				output: formattedError,
			};
		}

		// 5. Return successful output
		const output =
			stdout.trim() || "Program executed successfully with no output.";
		logger.success(`Code executed successfully [ID: ${executionId}]`);
		logger.success(`Output:\n${output}`);
		return {
			success: true,
			output,
		};
	} catch (error) {
		// 6. Handle execution errors
		let errorMessage = "";

		if (error instanceof Error) {
			// Check if the error contains compilation/runtime errors
			const errorText = error.message;
			if (
				errorText.includes(": error:") ||
				errorText.includes("Exception") ||
				errorText.includes("Error:")
			) {
				errorMessage = formatError(errorText, language);
			} else {
				// Generic error (timeout, system error, etc.)
				errorMessage = error.message;
			}
		} else {
			errorMessage = String(error);
		}

		logger.error(
			`Failed to execute code [ID: ${executionId}]: ${errorMessage}`,
		);
		return {
			success: false,
			output: errorMessage,
		};
	}
};

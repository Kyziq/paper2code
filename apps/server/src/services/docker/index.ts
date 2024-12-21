import { exec } from "node:child_process";
import util from "node:util";
import { logger } from "~/utils/logger";
import type { SupportedLanguage } from "~shared/constants";
import { DOCKER_CONFIG } from "./config";
import { getLanguageHandler } from "./handlers";

const execPromise = util.promisify(exec);

const formatError = (errorText: string): string => {
	return errorText
		.split("\n")
		.filter((line) => line.trim()) // Remove empty lines
		.map((line) => line.replace(/\/tmp\/temp_[^/]+\//, "")) // Remove temp paths
		.join("\n");
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
): Promise<string> => {
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
			const cleanError = formatError(stderr);
			throw new Error(cleanError);
		}

		// 5. Return successful output
		logger.docker(`Code executed successfully [ID: ${executionId}]`);

		return stdout.trim() || "Program executed successfully with no output.";
	} catch (error) {
		// 6. Handle any errors
		const errorMessage = error instanceof Error ? error.message : String(error);
		logger.error(
			`Failed to execute code [ID: ${executionId}]: ${errorMessage}`,
		);
		throw error; // Re-throw the error to be handled by the caller
	}
};

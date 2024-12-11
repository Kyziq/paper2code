import { exec } from "node:child_process";
import util from "node:util";
import { logger } from "~/utils/logger";
import type { SupportedLanguage } from "~shared/constants";
import { DOCKER_CONFIG } from "./config";
import { getLanguageHandler } from "./handlers";

const execPromise = util.promisify(exec);

const buildDockerExecCommand = (serviceName: string, command: string) => {
	const baseCommand = `docker compose exec -T ${serviceName} sh -c '${command}'`;
	return process.platform === "win32"
		? `powershell -Command "& {${baseCommand}}"`
		: baseCommand;
};

export const runContainer = async (
	content: string,
	language: SupportedLanguage,
): Promise<string> => {
	const executionId = `${language}-${Date.now()}`;
	const handler = getLanguageHandler(language);

	try {
		const encodedContent = Buffer.from(content).toString("base64");
		logger.docker(`Code prepared for execution [ID: ${executionId}]`);

		// Build and execute command
		const dockerCommand = handler.buildCommand(encodedContent, executionId);
		const command = buildDockerExecCommand(
			handler.getServiceName(),
			dockerCommand,
		);

		logger.docker(`Running command in container [ID: ${executionId}]`);
		const { stdout, stderr } = await execPromise(command, {
			timeout: DOCKER_CONFIG.EXECUTION.TIMEOUT,
		});

		logger.success(`Execution completed [ID: ${executionId}]`);
		if (stderr) logger.error(`Error output:\n${stderr.trim()}`);

		return stdout.trim();
	} catch (error) {
		const errorMessage = error instanceof Error ? error.message : String(error);
		logger.error(`Execution error [ID: ${executionId}]: ${errorMessage}`);

		if (errorMessage.includes("error:")) {
			throw new Error(`Compilation failed: ${errorMessage}`);
		}
		throw new Error(`Execution failed: ${errorMessage}`);
	}
};

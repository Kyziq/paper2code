import { exec } from "node:child_process";
import util from "node:util";
import { logger } from "~/utils/logger";

const execPromise = util.promisify(exec);

const DOCKER_CONFIG = {
	CONTAINER: {
		NAME: "cpp-script-runner",
		SERVICE: "cpp-runner",
	},
	EXECUTION: {
		TIMEOUT: 60000,
		TEMP_FILE_PREFIX: "/tmp/temp",
	},
};

/**
 * Constructs the Docker command sequence for compiling and running C++ code.
 * The sequence:
 * 1. Decodes base64 content to a .cpp file
 * 2. Compiles the file with g++
 * 3. Executes the compiled program
 * 4. Cleans up temporary files
 */
const buildDockerCommand = (encodedContent: string): string => {
	const { TEMP_FILE_PREFIX } = DOCKER_CONFIG.EXECUTION;
	return [
		`echo ${encodedContent} | base64 -d > ${TEMP_FILE_PREFIX}.cpp`,
		`g++ ${TEMP_FILE_PREFIX}.cpp -o ${TEMP_FILE_PREFIX}`,
		TEMP_FILE_PREFIX,
		`rm -f ${TEMP_FILE_PREFIX}.cpp ${TEMP_FILE_PREFIX}`,
	].join(" && ");
};

/**
 * Constructs the full execution command based on the host OS platform.
 * Windows requires PowerShell wrapping, while Unix-like systems use direct shell commands.
 */
const buildExecutionCommand = (dockerCommand: string): string => {
	const { SERVICE } = DOCKER_CONFIG.CONTAINER;
	const baseCommand = `docker compose exec -T ${SERVICE} sh -c '${dockerCommand}'`;

	return process.platform === "win32"
		? `powershell -Command "& {${baseCommand}}"`
		: baseCommand;
};

/**
 * Executes C++ code inside a Docker container with proper isolation.
 * The process:
 * 1. Wraps the user code in a complete C++ program
 * 2. Encodes the program in base64 for safe transmission
 * 3. Executes the code in an isolated container
 * 4. Returns the program output
 *
 * @param content - The C++ code to execute
 * @returns Promise<string> The stdout output from the code execution
 * @throws Error if compilation or execution fails
 */
export const runDockerContainer = async (
	content: string,
	language: string,
): Promise<string> => {
	const executionId = `${language}-${Date.now()}`;

	try {
		// TESTING PURPOSE
		const TESTING = `
#include <iostream>
using namespace std;

int main() {
    cout << "Hello world123123" << endl;
    return 0;
}`;

		const encodedContent = Buffer.from(TESTING).toString("base64");
		logger.docker(`Code prepared for execution [ID: ${executionId}]`);

		// Construct and execute the command
		const dockerCommand = buildDockerCommand(encodedContent);
		const command = buildExecutionCommand(dockerCommand);
		logger.docker(`Running command in container [ID: ${executionId}]`);

		const { stdout } = await execPromise(command, {
			timeout: DOCKER_CONFIG.EXECUTION.TIMEOUT,
		});
		logger.success(`Execution completed [ID: ${executionId}]`);
		logger.success(`Program output:\n${stdout.trim()}`);

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

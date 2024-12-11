import { exec } from "node:child_process";
import util from "node:util";
import { logger } from "~/utils/logger";
import type { SupportedLanguage } from "~shared/constants";

const execPromise = util.promisify(exec);

const DOCKER_CONFIG = {
	CONTAINER: {
		CPP: {
			NAME: "cpp-script-runner",
			SERVICE: "cpp-runner",
		},
		JAVA: {
			NAME: "java-script-runner",
			SERVICE: "java-runner",
		},
	},
	EXECUTION: {
		TIMEOUT: 60000,
		TEMP_FILE_PREFIX: "/tmp/temp",
	},
	USE_TEST_CODE: true,
};

const TEST_CODE = {
	cpp: `#include <iostream>
using namespace std;

int main() {
    cout << "Hello World from C++" << endl;
    return 0;
}`,
	java: `public class Main {
    public static void main(String[] args) {
        System.out.println("Hello World from Java");
    }
}`,
};

/**
 * Extracts the public class name from Java code
 * Returns null if no public class is found
 */
const extractJavaClassName = (code: string): string | null => {
	const classMatch = code.match(/public\s+class\s+(\w+)/);
	return classMatch ? classMatch[1] : null;
};

/**
 * Gets the code to execute - either test code or actual user code
 */
const getExecutableCode = (
	content: string,
	language: SupportedLanguage,
): string => {
	if (DOCKER_CONFIG.USE_TEST_CODE) {
		logger.docker(`Using test code for ${language}`);
		return TEST_CODE[language];
	}

	// Use the complete user-provided code as is
	logger.docker(`Using user-provided code for ${language}`);
	return content;
};

/**
 * Constructs Docker commands for different languages
 */
const buildLanguageSpecificCommand = (
	encodedContent: string,
	language: SupportedLanguage,
	executionId: string,
): string => {
	const { TEMP_FILE_PREFIX } = DOCKER_CONFIG.EXECUTION;

	// Create unique directory for execution
	const uniqueDir = `${TEMP_FILE_PREFIX}_${executionId}`;

	switch (language) {
		case "java": {
			const code = Buffer.from(encodedContent, "base64").toString();
			const className = extractJavaClassName(code);
			if (!className) throw new Error("No public class found in Java code");
			logger.docker(`Detected Java class name: ${className}`);

			const commands = [
				// Create unique directory
				`mkdir -p ${uniqueDir}`,
				// Write Java file with exact class name
				`echo ${encodedContent} | base64 -d > ${uniqueDir}/${className}.java`,
				// Compile in the unique directory
				`javac ${uniqueDir}/${className}.java`,
				// Execute from the unique directory
				`cd ${uniqueDir} && java ${className}`,
				// Clean up everything
				`rm -rf ${uniqueDir}`,
			];
			return commands.join(" && ");
		}

		case "cpp": {
			const sourceFile = "program.cpp";
			const executableFile = "program";

			const commands = [
				// Create unique directory for isolation
				`mkdir -p ${uniqueDir}`,
				// Write source code to the unique directory
				`echo ${encodedContent} | base64 -d > ${uniqueDir}/${sourceFile}`,
				// Compile in the unique directory
				`g++ ${uniqueDir}/${sourceFile} -o ${uniqueDir}/${executableFile}`,
				// Execute from the unique directory
				`cd ${uniqueDir} && ./${executableFile}`,
				// Clean up everything
				`rm -rf ${uniqueDir}`,
			];

			return commands.join(" && ");
		}

		default:
			throw new Error(`Unsupported language: ${language}`);
	}
};

/**
 * Gets the appropriate Docker service name based on the language
 */
const getDockerService = (language: SupportedLanguage): string => {
	const services = {
		cpp: DOCKER_CONFIG.CONTAINER.CPP.SERVICE,
		java: DOCKER_CONFIG.CONTAINER.JAVA.SERVICE,
	};
	return services[language];
};

/**
 * Constructs the full execution command based on the host OS platform
 */
const buildExecutionCommand = (
	dockerCommand: string,
	language: SupportedLanguage,
): string => {
	const service = getDockerService(language);
	const baseCommand = `docker compose exec -T ${service} sh -c '${dockerCommand}'`;

	return process.platform === "win32"
		? `powershell -Command "& {${baseCommand}}"`
		: baseCommand;
};

/**
 * Executes code inside a Docker container with proper isolation.
 *
 * @param content - The source code to execute
 * @param language - The programming language of the code
 * @returns Promise<string> The stdout output from the code execution
 * @throws Error if compilation or execution fails
 */

export const runDockerContainer = async (
	content: string,
	language: SupportedLanguage,
): Promise<string> => {
	const executionId = `${language}-${Date.now()}`;

	try {
		// Get either test code or actual user code
		const codeToExecute = getExecutableCode(content, language);
		const encodedContent = Buffer.from(codeToExecute).toString("base64");
		logger.docker(`Code prepared for execution [ID: ${executionId}]`);
		logger.docker(
			`Using ${DOCKER_CONFIG.USE_TEST_CODE ? "test" : "user-provided"} code`,
		);

		// Construct and execute the command
		const dockerCommand = buildLanguageSpecificCommand(
			encodedContent,
			language,
			executionId,
		);
		const command = buildExecutionCommand(dockerCommand, language);
		logger.docker(`Running command in container [ID: ${executionId}]`);
		const { stdout, stderr } = await execPromise(command, {
			timeout: DOCKER_CONFIG.EXECUTION.TIMEOUT,
		});
		logger.success(`Execution completed [ID: ${executionId}]`);
		logger.success(`Program output:\n${stdout.trim()}`);

		if (stderr) {
			logger.error(`Error output:\n${stderr.trim()}`);
		}
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

import { DOCKER_CONFIG } from "../config";
import type { LanguageHandler } from "../handlers";

export const cppHandler: LanguageHandler = {
	// Return the Docker service name for C++ execution
	getServiceName: () => DOCKER_CONFIG.CONTAINER.CPP.SERVICE,

	// Build the command to execute C++ code
	buildCommand: (encodedContent: string, executionId: string) => {
		// Create unique directory path for isolation
		const uniqueDir = `${DOCKER_CONFIG.EXECUTION.TEMP_FILE_PREFIX}_${executionId}`;

		// Define source and executable file names
		const sourceFile = `${executionId}.cpp`;
		const executableFile = executionId;

		// Build array of shell commands to execute
		const commands = [
			// Create directory and write file
			`mkdir -p ${uniqueDir}`,
			`echo ${encodedContent} | base64 -d > ${uniqueDir}/${sourceFile}`,

			// Compile with error capture
			`cd ${uniqueDir}`,
			`g++ ${sourceFile} -o ${executableFile} 2>&1`,

			// Run with error capture - only if compilation succeeds
			`if [ $? -eq 0 ]; then ./${executableFile} 2>&1; else exit 1; fi`,

			// Cleanup
			`cd .. && rm -rf ${uniqueDir}`,
		];

		// Join commands with AND operator
		return commands.join(" && ");
	},
};

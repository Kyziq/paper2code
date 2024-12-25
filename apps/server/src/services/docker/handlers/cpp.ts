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
			`mkdir -p ${uniqueDir}`, // Create temp directory
			`echo ${encodedContent} | base64 -d > ${uniqueDir}/${sourceFile}`, // Write C++ file
			`g++ ${uniqueDir}/${sourceFile} -o ${uniqueDir}/${executableFile}`, // Compile code
			`cd ${uniqueDir} && ./${executableFile}`, // Run the program
			`rm -rf ${uniqueDir}`, // Clean up
		];

		// Join commands with AND operator
		return commands.join(" && ");
	},
};

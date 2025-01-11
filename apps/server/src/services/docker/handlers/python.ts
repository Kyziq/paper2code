import { DOCKER_CONFIG } from "../config";
import type { LanguageHandler } from "../handlers";

export const pythonHandler: LanguageHandler = {
	// Return the Docker service name for Python execution
	getServiceName: () => DOCKER_CONFIG.CONTAINER.PYTHON.SERVICE,

	// Build the command to execute Python code
	buildCommand: (encodedContent: string, executionId: string) => {
		// Create unique directory path for isolation
		const uniqueDir = `${DOCKER_CONFIG.EXECUTION.TEMP_FILE_PREFIX}_${executionId}`;

		// Python source file name using execution ID
		const sourceFile = `${executionId}.py`;

		// Build array of shell commands to execute
		const commands = [
			`mkdir -p ${uniqueDir}`, // Create temp directory
			`echo ${encodedContent} | base64 -d > ${uniqueDir}/${sourceFile}`, // Write Python file
			`cd ${uniqueDir} && python3 -u ${sourceFile} 2>&1 || true`, // Execute with error capturing
			`rm -rf ${uniqueDir}`, // Clean up
		];

		// Join commands with AND operator
		return commands.join(" && ");
	},
};

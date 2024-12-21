import { DOCKER_CONFIG } from "../config";

export const pythonHandler = {
	// Return the Docker service name for Python execution
	getServiceName: () => "python-runner",

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
			`python3 ${uniqueDir}/${sourceFile}`, // Execute the script
			`rm -rf ${uniqueDir}`, // Clean up
		];

		// Join commands with AND operator
		return commands.join(" && ");
	},
};

import { DOCKER_CONFIG } from "../config";

export const pythonHandler = {
	getServiceName: () => "python-runner",

	buildCommand: (encodedContent: string, executionId: string) => {
		const uniqueDir = `${DOCKER_CONFIG.EXECUTION.TEMP_FILE_PREFIX}_${executionId}`;
		const sourceFile = "program.py";

		const commands = [
			// Create unique directory for isolation
			`mkdir -p ${uniqueDir}`,
			// Write source code to file
			`echo ${encodedContent} | base64 -d > ${uniqueDir}/${sourceFile}`,
			// Execute Python script
			`python3 ${uniqueDir}/${sourceFile}`,
			// Clean up
			`rm -rf ${uniqueDir}`,
		];

		return commands.join(" && ");
	},
};

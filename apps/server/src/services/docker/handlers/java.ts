import { DOCKER_CONFIG } from "../config";
import type { LanguageHandler } from "../handlers";

export const javaHandler: LanguageHandler = {
	// Return the Docker service name for Java execution
	getServiceName: () => DOCKER_CONFIG.CONTAINER.JAVA.SERVICE,

	// Build the command to execute Java code
	buildCommand: (encodedContent: string, executionId: string) => {
		// Create unique directory path for isolation
		const uniqueDir = `${DOCKER_CONFIG.EXECUTION.TEMP_FILE_PREFIX}_${executionId}`;

		// Java source file name based on execution ID
		const sourceFile = `${executionId}.java`;

		// Decode the Base64 encoded Java code
		const code = Buffer.from(encodedContent, "base64").toString();

		// Update the class name in the code to match the file name
		const updatedCode = code.replace(
			/public\s+class\s+\w+/, // Match "public class" followed by any word characters
			`public class ${executionId}`, // Replace with new class name
		);

		// Re-encode the modified code to Base64
		const finalEncodedCode = Buffer.from(updatedCode).toString("base64");

		// Build array of shell commands to execute
		const commands = [
			`mkdir -p ${uniqueDir}`, // Create temp directory
			`echo ${finalEncodedCode} | base64 -d > ${uniqueDir}/${sourceFile}`, // Write Java file
			`javac ${uniqueDir}/${sourceFile}`, // Compile the code
			`cd ${uniqueDir} && java ${executionId}`, // Run the program
			`rm -rf ${uniqueDir}`, // Clean up
		];

		// Join commands with AND operator
		return commands.join(" && ");
	},
};

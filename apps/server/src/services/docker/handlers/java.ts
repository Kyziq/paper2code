import { DOCKER_CONFIG } from "../config";

const extractJavaClassName = (code: string): string => {
	const classMatch = code.match(/public\s+class\s+(\w+)/);
	if (!classMatch) throw new Error("No public class found in Java code");
	return classMatch[1];
};

export const javaHandler = {
	getServiceName: () => "java-runner",

	getTestCode: () => `public class Main {
    public static void main(String[] args) {
        System.out.println("Hello World from Java");
    }
}`,

	buildCommand: (encodedContent: string, executionId: string) => {
		const uniqueDir = `${DOCKER_CONFIG.EXECUTION.TEMP_FILE_PREFIX}_${executionId}`;
		const code = Buffer.from(encodedContent, "base64").toString();
		const className = extractJavaClassName(code);

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
	},
};

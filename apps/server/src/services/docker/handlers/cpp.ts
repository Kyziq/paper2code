import { DOCKER_CONFIG } from "../config";

export const cppHandler = {
	getServiceName: () => "cpp-runner",

	getTestCode: () => `#include <iostream>
using namespace std;

int main() {
    cout << "Hello World from C++" << endl;
    return 0;
}`,

	buildCommand: (encodedContent: string, executionId: string) => {
		const uniqueDir = `${DOCKER_CONFIG.EXECUTION.TEMP_FILE_PREFIX}_${executionId}`;
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
	},
};

import { exec } from "node:child_process";
import util from "node:util";
import { logger } from "~/utils/logger";

const execPromise = util.promisify(exec);

/**
 * Normalizes Python code spacing and indentation.
 * @param content - The Python code to format
 * @returns Formatted Python code with consistent spacing and indentation
 */
const fixPythonSpacing = (inputContent: string): string => {
	logger.debug("Fixing Python spacing");

	// Remove shebang if present and any leading empty lines
	// This ensures the code starts with actual Python statements
	let formattedContent = inputContent.replace(/^(#!.*\n|\s*)*/, "");

	// Replace any spaces between function name and opening parenthesis
	// Example: print  ("Hello") -> print("Hello")
	formattedContent = formattedContent.replace(/(\w+)\s+\(/g, "$1(");

	// Process each line to handle indentation
	const lines = formattedContent.split("\n");
	let indentLevel = 0; // Tracks current indentation level
	const indentSize = 4; // Standard Python indentation is 4 spaces

	for (let i = 0; i < lines.length; i++) {
		const line = lines[i].trim();

		// Decrease indent for else/elif/except/finally blocks
		// as they should align with their corresponding if/try
		if (/^(else|elif|except|finally):/.test(line)) {
			indentLevel = Math.max(0, indentLevel - 1);
		}

		// Apply the current indentation level
		lines[i] = " ".repeat(indentLevel * indentSize) + line;

		// Increase indent after lines ending with colon
		// These indicate the start of a new block (if/for/while/etc)
		if (line.endsWith(":")) {
			indentLevel++;
		}

		// Decrease indent after return/break/continue/pass
		// as these often end a block
		if (/^(return|break|continue|pass)/.test(line)) {
			indentLevel = Math.max(0, indentLevel - 1);
		}
	}

	return lines.join("\n");
};

/**
 * Executes Python code inside a Docker container with proper isolation.
 * Uses base64 encoding to safely transmit the code into the container.
 *
 * @param content - The Python code to execute
 * @returns The stdout output from the code execution
 * @throws Error if execution fails
 */
export const runDockerContainer = async (content: string): Promise<string> => {
	logger.docker("Preparing to run code in Docker container");

	try {
		// Format the Python code
		const formattedContent = fixPythonSpacing(content);

		// Convert the code to base64 to safely pass it into the container
		// This prevents issues with quotes, newlines, and special characters
		const encodedContent = Buffer.from(formattedContent).toString("base64");

		// Construct the docker command that will:
		// 1. Execute in the python-runner container (-T disables pseudo-TTY)
		// 2. Run Python with the encoded content
		// 3. Decode the base64 content and execute it
		const command = `docker compose exec -T python-runner python -c "import base64; exec(base64.b64decode('${encodedContent}').decode())"`;

		logger.debug("Executing code in container");
		const { stdout } = await execPromise(command, { timeout: 60000 });
		logger.success("Script execution completed successfully");

		return stdout.trim();
	} catch (error) {
		const errorMessage = error instanceof Error ? error.message : String(error);
		logger.error(`Execution error: ${errorMessage}`);
		throw new Error(`Execution failed: ${errorMessage}`);
	}
};

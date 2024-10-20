import { existsSync, mkdirSync } from "node:fs";
import path from "node:path";

export const tempDir = path.resolve(__dirname, "../temp");

export const setupTempDirectory = () => {
	if (!existsSync(tempDir)) {
		mkdirSync(tempDir);
	}
};

import { mkdirSync, existsSync } from "fs";
import path from "path";

export const tempDir = path.resolve(__dirname, "../temp");

export const setupTempDirectory = () => {
  if (!existsSync(tempDir)) {
    mkdirSync(tempDir);
  }
};

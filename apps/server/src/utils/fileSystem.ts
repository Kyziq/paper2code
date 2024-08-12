import { mkdirSync, existsSync } from "fs";
import path from "path";

export const uploadDir = path.resolve(__dirname, "../uploads");

export const setupUploadDirectory = () => {
  if (!existsSync(uploadDir)) {
    mkdirSync(uploadDir);
  }
};

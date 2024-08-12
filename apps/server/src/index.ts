import { Elysia, t } from "elysia";
import { cors } from "@elysiajs/cors";
import path from "path";
import { setupUploadDirectory, uploadDir } from "./utils/fileSystem";
import { performOCR } from "./services/ocrService";
import { promises as fs } from "fs";
import { runDockerContainer } from "./services/dockerService";
import { logger } from "./utils/logger";

setupUploadDirectory();

const ALLOWED_FILE_TYPES = ["image/jpg", "image/jpeg", "image/png", "application/pdf"];

const app = new Elysia()
  .use(cors())
  .post(
    "/api/ocr",
    async ({ body }) => {
      try {
        const file = body.file[0];
        if (!file) {
          throw new Error("No file uploaded");
        }

        if (!ALLOWED_FILE_TYPES.includes(file.type)) {
          throw new Error(`Unsupported file type: ${file.type}`);
        }

        logger.info(`Processing ${file.type} file...`);
        const text = await performOCR(file);
        if (!text) {
          throw new Error("No text detected in the file");
        }
        logger.success("Text extraction completed");
        logger.info(`Extracted text preview: ${text.substring(0, 100)}`);

        const pythonFileName = `ocr_result_${Date.now()}.py`;
        const pythonFilePath = path.resolve(uploadDir, pythonFileName);
        await fs.writeFile(pythonFilePath, text);
        logger.success(`Python file created: ${pythonFilePath}`);

        return { message: "Text extraction successful", filePath: pythonFilePath };
      } catch (error) {
        logger.error("OCR processing failed: " + error);
        return { message: `Error during OCR processing: ${(error as Error).message}` };
      }
    },
    {
      body: t.Object({
        file: t.Files(),
      }),
      type: "formdata",
    }
  )
  .post(
    "/api/execute",
    async ({ body }) => {
      try {
        const pythonFilePath = body.filePath;
        if (!pythonFilePath) {
          throw new Error("No file path provided");
        }

        const fileName = path.basename(pythonFilePath);
        logger.info(`Executing file: ${fileName}`);

        try {
          const result = await runDockerContainer(pythonFilePath, fileName);
          logger.info(`Execution result preview: ${result.substring(0, 100)}`);
          return { message: "Execution successful", result };
        } catch (error) {
          logger.error(`Docker execution failed: ${(error as Error).message}`);
          return { message: `Error during Docker execution: ${(error as Error).message}` };
        } finally {
          try {
            const fileExists = await fs
              .access(pythonFilePath)
              .then(() => true)
              .catch(() => false);
            if (fileExists) {
              await fs.unlink(pythonFilePath);
              logger.success(`Python file deleted: ${pythonFilePath}`);
            } else {
              logger.warning(`Python file not found, could not delete: ${pythonFilePath}`);
            }
          } catch (error) {
            logger.error(`Failed to delete Python file: ${(error as Error).message}`);
          }
        }
      } catch (error) {
        logger.error(`File execution failed: ${(error as Error).message}`);
        return { message: `Error during file execution: ${(error as Error).message}` };
      }
    },
    {
      body: t.Object({
        filePath: t.String(),
      }),
      type: "json",
    }
  );

app.listen(3000, ({ hostname, port }) => {
  logger.info(`🦊 Elysia is running at http://${hostname}:${port}`);
});

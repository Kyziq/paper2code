import { cors } from '@elysiajs/cors';
import { Elysia, t } from 'elysia';
import { promises as fs } from 'fs';
import path from 'path';
import { runDockerContainer } from './services/dockerService';
import { performOCR } from './services/ocrService';
import { setupTempDirectory, tempDir } from './utils/fileSystem';
import { logger } from './utils/logger';

setupTempDirectory();

/* -------------------------------- Constants ------------------------------- */
const ALLOWED_FILE_TYPES = ['image/jpg', 'image/jpeg', 'image/png', 'application/pdf'];
const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10MB

const app = new Elysia()
  .use(cors())
  .post(
    '/api/ocr',
    async ({ body, set }) => {
      try {
        const file = body.file[0];
        if (!file) {
          set.status = 400;
          return { message: 'No file uploaded' };
        }

        if (!ALLOWED_FILE_TYPES.includes(file.type)) {
          set.status = 415;
          return { message: `Unsupported file type: ${file.type}` };
        }

        if (file.size > MAX_FILE_SIZE) {
          set.status = 413;
          return { message: 'File size exceeds the limit' };
        }

        logger.info(`Processing ${file.type} file...`);
        const text = await performOCR(file);
        if (!text) {
          throw new Error('No text detected in the file');
        }
        logger.success('Text extraction completed');
        logger.info(`Extracted text preview: ${text.substring(0, 100)}`);

        const pythonFileName = `ocr_result_${Date.now()}.py`;
        const pythonFilePath = path.resolve(tempDir, pythonFileName);
        await fs.writeFile(pythonFilePath, text);
        logger.success(`Python file created: ${pythonFilePath}`);

        return {
          message: 'Text extraction successful',
          filePath: pythonFilePath,
        };
      } catch (error) {
        logger.error('OCR processing failed: ' + error);
        return {
          message: `Error during OCR processing: ${(error as Error).message}`,
        };
      }
    },
    {
      body: t.Object({
        file: t.Files(),
      }),
      type: 'formdata',
    },
  )
  .post(
    '/api/execute',
    async ({ body }) => {
      const pythonFilePath = body.filePath;
      if (!pythonFilePath) {
        throw new Error('No file path provided');
      }

      const fileName = path.basename(pythonFilePath);
      logger.info(`Executing file: ${fileName}`);

      try {
        const result = await runDockerContainer(pythonFilePath, fileName);
        const trimmedResult = result.trim(); // Trim the result to remove extra newlines
        logger.info(`Execution result preview: ${trimmedResult}`);
        return { message: 'Execution successful', result: trimmedResult };
      } catch (error) {
        logger.error(`Docker execution failed: ${(error as Error).message}`);
        return { message: `Error during file execution: ${(error as Error).message}` };
      } finally {
        await fs.unlink(pythonFilePath);
        logger.success(`Python file deleted: ${pythonFilePath}`);
      }
    },
    {
      body: t.Object({
        filePath: t.String(),
      }),
      type: 'json',
    },
  );

app.listen(3000, ({ hostname, port }) => {
  logger.info(`🦊 Elysia is running at http://${hostname}:${port}`);
});

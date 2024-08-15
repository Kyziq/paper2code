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

      try {
        logger.info(`Processing ${file.type} file...`);
        const text = await performOCR(file);

        const pythonFileName = `ocr_result_${Date.now()}.py`;
        const pythonFilePath = path.resolve(tempDir, pythonFileName);
        await fs.writeFile(pythonFilePath, text);
        logger.info(`Python file created: ${pythonFilePath}`);

        return {
          message: 'Text extraction successful',
          filePath: pythonFilePath,
        };
      } catch (error) {
        logger.error(`OCR processing failed: ${(error as Error).message}`);
        set.status = 500;
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
    async ({ body, set }) => {
      const pythonFilePath = body.filePath;
      if (!pythonFilePath) {
        set.status = 400;
        throw new Error('No file path provided');
      }

      const fileName = path.basename(pythonFilePath);
      logger.info(`Executing file: ${fileName}`);

      try {
        const result = await runDockerContainer(fileName);
        logger.info(`Execution result preview: ${result}`);
        set.status = 200;
        return { message: 'Execution successful', result };
      } catch (error) {
        logger.error(`Execution failed: ${(error as Error).message}`);
        set.status = 500;
        return { message: `Error during file execution: ${(error as Error).message}` };
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

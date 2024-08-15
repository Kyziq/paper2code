import { exec } from 'child_process';
import { promises as fs } from 'fs';
import { tempDir } from '../utils/fileSystem';
import { logger } from '../utils/logger';

const checkDockerRunning = (): Promise<boolean> => {
  return new Promise((resolve) => {
    exec('docker info', (error) => {
      resolve(!error);
    });
  });
};

export const runDockerContainer = async (fileName: string): Promise<string> => {
  const isDockerRunning = await checkDockerRunning();
  if (!isDockerRunning)
    throw new Error(`Docker is not running. Please start Docker and try again.`);
  logger.info('Docker is running, proceeding with container execution');

  const containerName = `python-script-runner-${Date.now()}`;
  const command = `docker run --name ${containerName} --rm -v ${tempDir}:/code python:3.9-slim python /code/${fileName}`;
  const timeout = 60 * 1000; // 60 seconds

  logger.info(`Starting Docker container: ${containerName}\nRunning command: ${command}`);

  try {
    const result = await new Promise<string>((resolve, reject) => {
      exec(command, { timeout }, (error, stdout, stderr) => {
        if (error) {
          reject(new Error(`Docker execution failed: ${stderr}`));
        } else {
          resolve(stdout);
        }
      });
    });

    logger.info(`Docker execution completed for ${fileName}`);
    return result.trim();
  } finally {
    // Always attempt to delete the temporary local Python file
    const filePath = `${tempDir}/${fileName}`;
    await fs.unlink(filePath);
    logger.info(`Python file deleted: ${filePath}`);
  }
};

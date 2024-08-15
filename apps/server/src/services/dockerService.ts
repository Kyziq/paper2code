import { exec } from 'child_process';
import { tempDir } from '../utils/fileSystem';
import { logger } from '../utils/logger';

const checkDockerRunning = (): Promise<boolean> => {
  return new Promise((resolve) => {
    exec('docker info', (error) => {
      if (error) {
        logger.error('Docker is not running');
        resolve(false);
      } else {
        logger.info('Docker is running');
        resolve(true);
      }
    });
  });
};

export const runDockerContainer = async (filePath: string, fileName: string): Promise<string> => {
  const isDockerRunning = await checkDockerRunning();
  if (!isDockerRunning)
    throw new Error(`Docker is not running. Please start Docker and try again.`);
  logger.info('Docker is running, proceeding with container execution');

  const containerName = `python-script-runner-${Date.now()}`;
  const command = `docker run --name ${containerName} --rm -v ${tempDir}:/code python:3.9-slim python /code/${fileName}`;
  const timeout = 60 * 1000; // 60 seconds

  logger.info(`Starting Docker container: ${containerName}`);
  logger.info(`Running command: ${command}`);

  return new Promise((resolve, reject) => {
    exec(command, { timeout }, (error, stdout, stderr) => {
      if (error) {
        logger.error(`Docker execution failed: ${stderr}`);
        reject(`Error executing file: ${stderr}`);
      } else {
        logger.success(`Docker execution completed for ${fileName}`);
        resolve(stdout);
      }
    });
  });
};

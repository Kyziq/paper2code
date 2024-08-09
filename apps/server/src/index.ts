import { Elysia, t } from "elysia";
import { cors } from "@elysiajs/cors";
import { mkdirSync, existsSync, promises as fs } from "fs";
import path from "path";
import { exec } from "child_process";
import vision from "@google-cloud/vision";
import dotenv from "dotenv";

dotenv.config({
  path: path.resolve(__dirname, "../../../.env"),
});

const client = new vision.ImageAnnotatorClient({
  keyFilename: process.env.GCP_SERVICE_ACCOUNT_KEY_PATH,
});

// Define the directory to store uploaded files
const uploadDir = path.resolve(__dirname, "uploads");
if (!existsSync(uploadDir)) {
  mkdirSync(uploadDir);
}

// Helper function to execute Docker command
const runDockerContainer = (filePath: string, fileName: string): Promise<string> => {
  const containerName = `python-script-runner-${Date.now()}`;
  const command = `docker run --name ${containerName} --rm -v ${uploadDir}:/code python:3.9-slim python /code/${fileName}`;
  const timeout = 60 * 1000; // 60 seconds
  const execOptions = { timeout };

  return new Promise((resolve, reject) => {
    exec(command, execOptions, (error, stdout, stderr) => {
      if (error) {
        reject(`Error executing file: ${stderr}`);
      } else {
        resolve(stdout);
      }
    });
  });
};

const app = new Elysia()
  .use(cors())
  .post(
    "/api/ocr",
    async ({ body }) => {
      try {
        const file = body.file[0];
        if (!file) {
          return { message: "No file uploaded" };
        }
        if (!file || !["image/jpg", "image/jpeg", "image/png", "application/pdf"].includes(file.type)) {
          return { message: "Unsupported file type" };
        }

        // Save the uploaded file to a temporary location
        const tempFilePath = path.resolve(uploadDir, file.name);
        const arrayBuffer = await file.arrayBuffer();
        const uint8Array = new Uint8Array(arrayBuffer);
        await fs.writeFile(tempFilePath, uint8Array);

        // Perform OCR using Google Cloud Vision API
        const [result] = await client.textDetection(tempFilePath);
        const detections = result.textAnnotations || [];
        const text = detections.length > 0 ? detections[0].description : "";

        if (!text) {
          return { message: "OCR did not detect any text" };
        }

        console.log("OCR result:", text);

        // Create a Python file from the OCR result
        const pythonFileName = `ocr_result_${Date.now()}.py`;
        const pythonFilePath = path.resolve(uploadDir, pythonFileName);
        await fs.writeFile(pythonFilePath, text);

        // Return the path to the created Python file
        return { message: "OCR successful", filePath: pythonFilePath };
      } catch (error) {
        console.error("Error during OCR processing:", error);
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
    async ({ body }: { body: any }) => {
      try {
        const filePath = body.filePath;
        if (!filePath) {
          return { message: "No file path provided" };
        }

        const fileName = path.basename(filePath);

        // Run the Docker container with the provided file path
        const result = await runDockerContainer(filePath, fileName);
        console.log("Docker result:", result);

        // Optionally, delete the temporary file after execution
        await fs.unlink(filePath);

        return { message: "Execution successful", result };
      } catch (error) {
        console.error("Error during file execution:", error);
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
  console.log(`🦊 Elysia is running at http://${hostname}:${port}`);
});

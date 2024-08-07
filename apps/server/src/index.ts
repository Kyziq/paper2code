import { Elysia, t } from "elysia";
import { cors } from "@elysiajs/cors";
import { mkdirSync, existsSync, promises as fs } from "fs";
import path from "path";
import { exec } from "child_process";

const app = new Elysia().use(cors());

// Define the directory to store uploaded files
const uploadDir = path.resolve(__dirname, "uploads");
if (!existsSync(uploadDir)) {
  mkdirSync(uploadDir);
}

// Helper function to execute Docker command
const runDockerContainer = (filePath: string, fileName: string): Promise<string> => {
  const containerName = `python-script-runner-${Date.now()}`;
  const command = `docker run --name ${containerName} --rm -v ${uploadDir}:/code python:3.9-slim python /code/${fileName}`;

  return new Promise((resolve, reject) => {
    exec(command, (error, stdout, stderr) => {
      if (error) {
        console.error("Error executing Docker command:", error);
        reject(`Error executing file: ${stderr}`);
      } else {
        resolve(stdout);
      }
    });
  });
};

// Define the /upload endpoint
app.post(
  "/upload",
  async ({ body }) => {
    try {
      const file = body.file[0];
      if (!file) {
        return { message: "No file uploaded" };
      }

      // Save the uploaded file to the upload directory
      const filePath = path.resolve(uploadDir, file.name);
      const arrayBuffer = await file.arrayBuffer();
      const uint8Array = new Uint8Array(arrayBuffer);
      await fs.writeFile(filePath, uint8Array);

      // Run the Docker container with the uploaded file
      const result = await runDockerContainer(filePath, file.name);
      return { message: result };
    } catch (error: any) {
      console.error("Error during file upload:", error);
      return { message: `Error during file upload: ${error.message}` };
    }
  },
  {
    body: t.Object({
      file: t.Files(),
    }),
    type: "formdata",
  }
);

// Start the server
const PORT = 3000;
app.listen(PORT);
console.log(`Server is running on http://localhost:${PORT}`);

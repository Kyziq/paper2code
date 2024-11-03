import { promises as fs } from "node:fs";
import path from "node:path";
import { cors } from "@elysiajs/cors";
import { Elysia, t } from "elysia";
import {
	cleanupDockerService,
	initializeDockerService,
	runDockerContainer,
} from "~/services/dockerService";
import { performOCR } from "~/services/ocrService";
import {
	ALLOWED_FILE_TYPES,
	FILE_SIZE_LIMITS,
	TEMP_DIR,
} from "~/utils/constants";
import {
	ApiError,
	BadRequestError,
	PayloadTooLargeError,
	UnsupportedMediaTypeError,
} from "~/utils/errors";
import { logger } from "~/utils/logger";
import type { FileExecutionResponse, FileUploadResponse } from "~shared/types";

await initializeDockerService().catch((error) => {
	logger.error(`Failed to initialize Docker service: ${error}`);
	process.exit(1);
});

/* -------------------------------- Constants ------------------------------- */
const app = new Elysia()
	.use(cors())
	.post(
		"/api/ocr",
		async ({ body, set }): Promise<FileUploadResponse> => {
			const file = body.file[0];
			if (!file) {
				logger.error("No file uploaded");
				throw new BadRequestError("No file uploaded");
			}
			logger.info(`Received file: ${file.name} (${file.type})`);

			if (!ALLOWED_FILE_TYPES.includes(file.type)) {
				logger.warning(`Unsupported file type: ${file.type}`);
				throw new UnsupportedMediaTypeError(
					`Unsupported file type ${file.type}`,
				);
			}

			const sizeLimit = file.type.startsWith("image/")
				? FILE_SIZE_LIMITS["image/*"]
				: FILE_SIZE_LIMITS[file.type as keyof typeof FILE_SIZE_LIMITS];
			if (file.size > sizeLimit) {
				logger.warning(
					`File size (${(file.size / (1024 * 1024)).toFixed(2)} MB) exceeds limit (${sizeLimit / (1024 * 1024)} MB)`,
				);
				throw new PayloadTooLargeError(
					`Your ${file.type} file size is ${(file.size / (1024 * 1024)).toFixed(2)} MB. It should be less than ${sizeLimit / (1024 * 1024)} MB`,
				);
			}

			try {
				logger.info(`Processing ${file.type} file: ${file.name}`);
				const text = await performOCR(file);
				logger.ocr(`OCR completed for ${file.name}`);

				const pythonFileName = `ocr_result_${Date.now()}.py`;
				const pythonFilePath = path.resolve(TEMP_DIR, pythonFileName);
				await fs.writeFile(pythonFilePath, text);
				logger.success(`Python file created: ${pythonFilePath}`);

				return {
					message: "Text extraction successful",
					data: {
						uploadedFilePath: pythonFilePath,
					},
				};
			} catch (error) {
				logger.error(
					`OCR processing failed for ${file.name}. ${(error as Error).message}`,
				);
				set.status = 500;
				return {
					message: `Error during OCR processing. ${(error as Error).message}`,
				};
			}
		},
		{
			body: t.Object({
				file: t.Files(),
			}),
			type: "formdata",
			response: t.Object({
				message: t.String(),
				data: t.Optional(
					t.Object({
						uploadedFilePath: t.String(),
					}),
				),
			}),
		},
	)
	.post(
		"/api/execute",
		async ({ body }): Promise<FileExecutionResponse> => {
			const pythonFilePath = body.filePath;
			if (!pythonFilePath) {
				logger.error("No file path provided for execution");
				throw new BadRequestError("No file path provided");
			}

			const fileName = path.basename(pythonFilePath);
			logger.docker(`Preparing to execute file: ${fileName}`);
			try {
				const output = await runDockerContainer(fileName);
				logger.docker(`Execution completed for ${fileName}`);
				logger.debug(`Execution output:\n${output}`);
				return {
					message: "File execution successful",
					data: { output },
				};
			} catch (error) {
				logger.error(
					`Execution failed for ${fileName}. ${(error as Error).message}`,
				);
				throw new Error(
					`Error during file execution. ${(error as Error).message}`,
				);
			}
		},
		{
			body: t.Object({
				filePath: t.String(),
			}),
			type: "json",
			response: t.Object({
				message: t.String(),
				data: t.Optional(
					t.Object({
						output: t.String(),
					}),
				),
			}),
		},
	)
	.onError(({ error, set }) => {
		if (error instanceof ApiError) {
			set.status = error.statusCode;
			return {
				status: "error",
				statusCode: error.statusCode,
				message: error.message,
			};
		}

		logger.error(`Unexpected error: ${error}`);
		set.status = 500;
		return {
			status: "error",
			statusCode: 500,
			message: "An unexpected error occurred",
		};
	})
	.onRequest(({ request }) => {
		logger.api(`${request.method} ${request.url}`);
	});

app.listen(3000, ({ hostname, port }) => {
	logger.info(`🦊 Elysia is running at http://${hostname}:${port}`);
});

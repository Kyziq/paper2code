import { promises as fs } from "node:fs";
import path from "node:path";
import { Elysia, t } from "elysia";
import { performOCR } from "~/services/ocrService";
import {
	ALLOWED_FILE_TYPES,
	FILE_SIZE_LIMITS,
	TEMP_DIR,
} from "~/utils/constants";
import {
	BadRequestError,
	PayloadTooLargeError,
	UnsupportedMediaTypeError,
} from "~/utils/errors";
import { logger } from "~/utils/logger";
import type { FileUploadResponse } from "~shared/types";

export const ocrRoute = new Elysia().post(
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
			throw new UnsupportedMediaTypeError(`Unsupported file type ${file.type}`);
		}

		const sizeLimit = file.type.startsWith("image/")
			? FILE_SIZE_LIMITS["image/*"]
			: FILE_SIZE_LIMITS[file.type as keyof typeof FILE_SIZE_LIMITS];

		if (file.size > sizeLimit) {
			logger.warning(
				`File size (${(file.size / (1024 * 1024)).toFixed(2)} MB) exceeds limit`,
			);
			throw new PayloadTooLargeError(
				`File size exceeds ${sizeLimit / (1024 * 1024)} MB limit`,
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
);

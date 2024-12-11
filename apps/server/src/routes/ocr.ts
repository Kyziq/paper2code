import { Elysia, t } from "elysia";
import { processOCR } from "~/services/ocr";
import {
	BadRequestError,
	PayloadTooLargeError,
	UnsupportedMediaTypeError,
} from "~/utils/errors";
import { logger } from "~/utils/logger";
import {
	MAX_FILE_SIZES,
	SUPPORTED_FILE_TYPES,
	type SupportedMimeType,
} from "~shared/constants";
import type { FileUploadResponse } from "~shared/types";

export const ocrRoute = new Elysia().post(
	"/api/ocr",
	async ({ body, set }): Promise<FileUploadResponse> => {
		// Extract file and language from request body
		const file = body.file[0];
		const language = body.language;

		// Validate file presence
		if (!file) {
			logger.error("No file uploaded");
			throw new BadRequestError("No file uploaded");
		}
		logger.info(`Received file: ${file.name} (${file.type})`);

		// Validate file type
		const supportedTypes = Object.values(SUPPORTED_FILE_TYPES);
		if (!supportedTypes.includes(file.type as SupportedMimeType)) {
			logger.warn(`Unsupported file type: ${file.type}`);
			throw new UnsupportedMediaTypeError(`Unsupported file type ${file.type}`);
		}

		// Validate file size
		const fileType = file.type as SupportedMimeType;
		const sizeLimit = MAX_FILE_SIZES[fileType];
		if (file.size > sizeLimit) {
			const limitInMB = sizeLimit / (1024 * 1024);
			logger.warn(
				`File size (${(file.size / (1024 * 1024)).toFixed(2)} MB) exceeds ${limitInMB}MB limit`,
			);
			throw new PayloadTooLargeError(`File size exceeds ${limitInMB} MB limit`);
		}

		// Process the file through OCR
		try {
			logger.info(`Processing ${file.type} file: ${file.name}`);
			const code = await processOCR(file);
			logger.ocr(`OCR completed for ${file.name}`);

			return {
				message: "Text extraction successful",
				data: {
					code,
					language,
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
		// Request validation schema
		body: t.Object({
			file: t.Files(),
			language: t.String(),
		}),
		type: "formdata",

		// Response validation schema
		response: t.Object({
			message: t.String(),
			data: t.Optional(
				t.Object({
					code: t.String(),
					language: t.String(),
				}),
			),
		}),
	},
);

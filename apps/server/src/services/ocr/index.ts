import { logger } from "~/utils/logger";
import {
	createBucketIfNotExists,
	deleteGCSFile,
	uploadGCSFile,
} from "~/utils/storage";
import { processImage } from "./handlers/image";
import { processPDF } from "./handlers/pdf";

export async function processOCR(file: File): Promise<string> {
	logger.ocr(`Starting OCR process for file: ${file.name}`);

	try {
		await createBucketIfNotExists();
		await uploadGCSFile(file);

		const result =
			file.type === "application/pdf"
				? await processPDF(file.name)
				: await processImage(file.name);

		logger.success(`OCR process completed successfully for ${file.name}`);
		return result;
	} finally {
		await deleteGCSFile(file.name);
	}
}

import { gcpConfig, visionClient } from "~/config/gcp.config";
import { logger } from "~/utils/logger";

export async function processImage(fileName: string): Promise<string> {
	logger.ocr(`Starting OCR process for image: ${fileName}`);

	try {
		const gcsSourceUri = `gs://${gcpConfig.bucket.name}/${fileName}`;
		const [result] = await visionClient.documentTextDetection({
			image: { source: { imageUri: gcsSourceUri } },
			imageContext: {
				languageHints: ["en-t-i0-handwrit"],
			},
		});

		if (!result.fullTextAnnotation?.text) {
			throw new Error("No text detected in the image.");
		}

		const text = result.fullTextAnnotation.text.trim();
		logger.detailedOCR(result.fullTextAnnotation, "image");

		return text;
	} catch (error) {
		throw new Error(`Failed to process image ${fileName}: ${error}`);
	}
}

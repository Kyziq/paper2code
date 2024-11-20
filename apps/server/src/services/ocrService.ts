import path from "node:path";
import { Storage } from "@google-cloud/storage";
import vision from "@google-cloud/vision";
import dotenv from "dotenv";
import { logger } from "~/utils/logger";

dotenv.config({ path: path.resolve(__dirname, "../../../../.env") });
const client = new vision.ImageAnnotatorClient({
	keyFilename: process.env.GCP_SERVICE_ACCOUNT_KEY_PATH,
});
const storage = new Storage({
	keyFilename: process.env.GCP_SERVICE_ACCOUNT_KEY_PATH,
});
const bucketName = process.env.GCP_STORAGE_BUCKET_NAME ?? "";
const storageClass = process.env.GCP_STORAGE_CLASS ?? "";
const location = process.env.GCP_STORAGE_LOCATION ?? "";

async function createBucketIfNotExists() {
	logger.info(`Checking if bucket ${bucketName} exists`);
	try {
		const [bucketExists] = await storage.bucket(bucketName).exists();
		if (!bucketExists) {
			logger.info(`Bucket ${bucketName} does not exist. Creating...`);
			const [bucket] = await storage.createBucket(bucketName, {
				location,
				[storageClass]: true,
			});
			logger.success(
				`Bucket ${bucket.name} created with ${storageClass} class in ${location}`,
			);
		} else {
			logger.info(`Using existing bucket: ${bucketName}`);
		}
	} catch (error) {
		logger.error(`Error creating/checking bucket: ${error}`);
		throw error;
	}
}

export const handleImage = async (fileName: string): Promise<string> => {
	logger.ocr(`Starting OCR process for image: ${fileName}`);
	try {
		const gcsSourceUri = `gs://${bucketName}/${fileName}`;

		const [result] = await client.documentTextDetection({
			image: {
				source: { imageUri: gcsSourceUri },
			},
			imageContext: {
				// specifies English language (en), transform extension singleton (t),
				// input method engine transform extension code (i0), and handwriting transform code (handwrit)
				languageHints: ["en-t-i0-handwrit"],
			},
		});
		const fullTextAnnotation = result.fullTextAnnotation;

		if (!fullTextAnnotation || !fullTextAnnotation.text)
			throw new Error("No text detected in the image.");

		logger.ocr(`OCR completed for image: ${fileName}`);
		logger.ocr(`Detected text: \n${fullTextAnnotation.text.trim()}`);
		logger.logOCR(fullTextAnnotation, "image");
		return fullTextAnnotation.text.trim();
	} catch (error) {
		throw new Error(`Failed to perform OCR on image ${fileName}: ${error}`);
	}
};

export const handlePDF = async (filePath: string): Promise<string> => {
	// TODO: Implement PDF handling logic
	throw new Error("PDF handling not implemented yet");
};

export const performOCR = async (file: File): Promise<string> => {
	logger.ocr(`Starting OCR process for file: ${file.name}`);
	await createBucketIfNotExists();
	const bucket = storage.bucket(bucketName);
	const blob = bucket.file(file.name);

	try {
		// Get the array buffer of the file
		const arrayBuffer = await file.arrayBuffer();
		const buffer = Buffer.from(arrayBuffer);

		// Upload the file to Google Cloud Storage
		logger.info(`Uploading file to bucket: ${file.name}`);
		await blob.save(buffer, {
			contentType: file.type,
		});
		logger.success(`File uploaded to bucket: ${file.name}`);

		// Perform OCR
		let text: string;
		if (file.type === "application/pdf") {
			logger.info(`Processing PDF file: ${file.name}`);
			text = await handlePDF(file.name);
		} else {
			logger.info(`Processing image file: ${file.name}`);
			text = await handleImage(file.name);
		}

		if (!text) {
			logger.warn(`No text detected in the file: ${file.name}`);
			throw new Error("No text detected in the file");
		}

		logger.success(`OCR process completed successfully for ${file.name}`);
		return text;
	} finally {
		// Always attempt to delete the file at cloud
		logger.info(`Attempting to delete file from bucket: ${file.name}`);
		try {
			await blob.delete();
			logger.delete(`File deleted from bucket: ${file.name}`);
		} catch (deleteError) {
			logger.error(`Failed to delete file from bucket: ${deleteError}`);
		}
	}
};

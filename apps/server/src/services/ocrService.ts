import { Storage } from "@google-cloud/storage";
import vision, { protos } from "@google-cloud/vision";
import { logger } from "~/utils/logger";

const client = new vision.ImageAnnotatorClient({
	keyFilename: Bun.env.GCP_SERVICE_ACCOUNT_KEY_PATH,
});
const storage = new Storage({
	keyFilename: Bun.env.GCP_SERVICE_ACCOUNT_KEY_PATH,
});
const bucketName = Bun.env.GCP_STORAGE_BUCKET_NAME ?? "";
const storageClass = Bun.env.GCP_STORAGE_CLASS ?? "";
const location = Bun.env.GCP_STORAGE_LOCATION ?? "";

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

export const handlePDF = async (fileName: string): Promise<string> => {
	logger.ocr(`Starting OCR process for PDF: ${fileName}`);

	try {
		const gcsSourceUri = `gs://${bucketName}/${fileName}`;
		const outputPrefix = `output-${Date.now()}`;
		const gcsDestinationUri = `gs://${bucketName}/${outputPrefix}/`;

		const inputConfig: protos.google.cloud.vision.v1.IInputConfig = {
			mimeType: "application/pdf",
			gcsSource: {
				uri: gcsSourceUri,
			},
		};

		const outputConfig: protos.google.cloud.vision.v1.IOutputConfig = {
			gcsDestination: {
				uri: gcsDestinationUri,
			},
		};

		const features: protos.google.cloud.vision.v1.IFeature[] = [
			{
				type: protos.google.cloud.vision.v1.Feature.Type
					.DOCUMENT_TEXT_DETECTION,
			},
		];

		const request: protos.google.cloud.vision.v1.IAsyncBatchAnnotateFilesRequest =
			{
				requests: [
					{
						inputConfig,
						features,
						outputConfig,
					},
				],
			};

		// Start the operation
		logger.info("Starting PDF processing");
		const [operation] = await client.asyncBatchAnnotateFiles(request);

		// Wait for the operation to complete
		logger.info("Waiting for PDF processing to complete...");
		const [filesResponse] = await operation.promise();

		if (!filesResponse?.responses?.[0]?.outputConfig?.gcsDestination?.uri) {
			throw new Error("Invalid response from Vision API");
		}

		// Get the JSON results from GCS
		const jsonUri = filesResponse.responses[0].outputConfig.gcsDestination.uri;
		logger.info(`PDF processing complete. Results saved to: ${jsonUri}`);

		// Wait briefly for the file to be available
		// await new Promise((resolve) => setTimeout(resolve, 2000));

		// Download and parse the results
		const resultBucket = storage.bucket(bucketName);
		const jsonOutputPath = `${outputPrefix}/output-1-to-1.json`;
		const resultFile = resultBucket.file(jsonOutputPath);

		// Check if file exists
		const [exists] = await resultFile.exists();
		if (!exists) {
			logger.error(`Output file not found: ${jsonOutputPath}`);
			// Try alternative file name
			const alternativeJsonPath = `${outputPrefix}/output-0-to-0.json`;
			const alternativeFile = resultBucket.file(alternativeJsonPath);
			const [alternativeExists] = await alternativeFile.exists();
			if (!alternativeExists) {
				throw new Error(
					`Neither ${jsonOutputPath} nor ${alternativeJsonPath} were found`,
				);
			}
			logger.info(`Found alternative output file: ${alternativeJsonPath}`);
			const [content] = await alternativeFile.download();
			const result = JSON.parse(content.toString());
			const extractedText = result?.responses?.[0]?.fullTextAnnotation?.text;

			logger.logOCR(extractedText, "pdf");

			if (!extractedText) {
				throw new Error("No text detected in the PDF");
			}

			// Clean up the output files
			try {
				const [files] = await resultBucket.getFiles({ prefix: outputPrefix });
				await Promise.all(files.map((file) => file.delete()));
				logger.delete(`Deleted output files with prefix: ${outputPrefix}`);
			} catch (cleanupError) {
				logger.error(`Failed to clean up output files: ${cleanupError}`);
			}

			logger.ocr(`OCR completed for PDF: ${fileName}`);
			logger.ocr(`Detected text: ${extractedText.trim()}`);

			return extractedText.trim();
		}

		// If original file exists, process it
		const [content] = await resultFile.download();
		const result = JSON.parse(content.toString());
		const extractedText = result?.responses?.[0]?.fullTextAnnotation?.text;

		if (!extractedText) {
			throw new Error("No text detected in the PDF");
		}

		// Clean up the output files
		try {
			const [files] = await resultBucket.getFiles({ prefix: outputPrefix });
			await Promise.all(files.map((file) => file.delete()));
			logger.delete(`Deleted output files with prefix: ${outputPrefix}`);
		} catch (cleanupError) {
			logger.error(`Failed to clean up output files: ${cleanupError}`);
		}

		logger.ocr(`OCR completed for PDF: ${fileName}`);
		logger.ocr(`Detected text: ${extractedText.trim()}`);

		return extractedText.trim();
	} catch (error) {
		throw new Error(`Failed to perform OCR on PDF ${fileName}: ${error}`);
	}
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

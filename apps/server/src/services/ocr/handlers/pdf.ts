import { protos } from "@google-cloud/vision";
import { gcpConfig, storageClient, visionClient } from "~/config/gcp.config";
import { logger } from "~/utils/logger";

async function cleanupOutputFiles(outputPrefix: string): Promise<void> {
	try {
		const bucket = storageClient.bucket(gcpConfig.bucket.name);
		const [files] = await bucket.getFiles({ prefix: outputPrefix });
		await Promise.all(files.map((file) => file.delete()));
		logger.delete(`Deleted output files with prefix: ${outputPrefix}`);
	} catch (error) {
		logger.error(`Failed to clean up output files: ${error}`);
	}
}

async function extractTextFromOutput(outputPrefix: string): Promise<string> {
	const bucket = storageClient.bucket(gcpConfig.bucket.name);
	const possiblePaths = [
		`${outputPrefix}/output-1-to-1.json`, // For multi-page PDFs
		`${outputPrefix}/output-0-to-0.json`, // For single-page PDFs
	];

	for (const path of possiblePaths) {
		const file = bucket.file(path);
		const [exists] = await file.exists();

		if (exists) {
			logger.info(`Found output file: ${path}`);
			const [content] = await file.download();
			const result = JSON.parse(content.toString());
			const extractedText = result?.responses?.[0]?.fullTextAnnotation?.text;

			if (extractedText) {
				logger.logOCR(extractedText, "pdf");
				return extractedText.trim();
			}
		}
	}

	throw new Error("No text detected in the PDF");
}

export async function processPDF(fileName: string): Promise<string> {
	const outputPrefix = `output-${Date.now()}`;
	logger.ocr(`Starting OCR process for PDF: ${fileName}`);

	try {
		const gcsSourceUri = `gs://${gcpConfig.bucket.name}/${fileName}`;
		const gcsDestinationUri = `gs://${gcpConfig.bucket.name}/${outputPrefix}/`;

		const request: protos.google.cloud.vision.v1.IAsyncBatchAnnotateFilesRequest =
			{
				requests: [
					{
						inputConfig: {
							mimeType: "application/pdf",
							gcsSource: {
								uri: gcsSourceUri,
							},
						},
						features: [
							{
								type: protos.google.cloud.vision.v1.Feature.Type
									.DOCUMENT_TEXT_DETECTION,
							},
						],
						outputConfig: {
							gcsDestination: {
								uri: gcsDestinationUri,
							},
						},
					},
				],
			};

		// Start the operation
		logger.info("Starting PDF processing");
		const [operation] = await visionClient.asyncBatchAnnotateFiles(request);

		// Wait for operation to complete
		const [filesResponse] = await operation.promise();
		logger.info("PDF processing complete");

		if (!filesResponse?.responses?.[0]?.outputConfig?.gcsDestination?.uri) {
			throw new Error("Invalid response from Vision API");
		}

		// Get the JSON results from GCS
		const jsonUri = filesResponse.responses[0].outputConfig.gcsDestination.uri;
		logger.info(`PDF processing complete. Results saved to: ${jsonUri}`);

		// Extract text from the output files
		const extractedText = await extractTextFromOutput(outputPrefix);

		logger.ocr(`OCR completed for PDF: ${fileName}`);
		logger.ocr(`Detected text: ${extractedText}`);

		return extractedText;
	} catch (error) {
		throw new Error(`Failed to perform OCR on PDF ${fileName}: ${error}`);
	} finally {
		// Always cleanup output files
		await cleanupOutputFiles(outputPrefix);
	}
}

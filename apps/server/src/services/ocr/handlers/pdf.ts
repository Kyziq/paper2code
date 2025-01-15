import { protos } from "@google-cloud/vision";
import { gcpConfig, storageClient, visionClient } from "~/config/gcp.config";
import { logger } from "~/utils/logger";

async function deleteGCSOutputFiles(outputPrefix: string): Promise<void> {
	try {
		const bucket = storageClient.bucket(gcpConfig.bucket.name);
		const [files] = await bucket.getFiles({ prefix: outputPrefix });
		await Promise.all(files.map((file) => file.delete()));
		logger.delete(`Deleted output files with prefix: ${outputPrefix}`);
	} catch (error) {
		logger.error(`Failed to clean up output files: ${error}`);
	}
}
async function downloadAndParseOutput(
	outputPrefix: string,
): Promise<protos.google.cloud.vision.v1.IAnnotateFileResponse | null> {
	const bucket = storageClient.bucket(gcpConfig.bucket.name);
	const possiblePaths = [
		`${outputPrefix}/output-0-to-0.json`, // For single-page PDFs
		`${outputPrefix}/output-1-to-1.json`, // For multi-page PDFs
	];

	for (const path of possiblePaths) {
		const file = bucket.file(path);
		const [exists] = await file.exists();
		if (exists) {
			logger.info(`Found output file: ${path}`);
			const [content] = await file.download();
			return JSON.parse(content.toString());
		}
	}
	return null;
}

async function extractTextFromOutput(outputPrefix: string): Promise<string> {
	const result = await downloadAndParseOutput(outputPrefix);
	if (!result) {
		throw new Error("No output files found");
	}

	const extractedText = result?.responses?.[0]?.fullTextAnnotation?.text;
	if (!extractedText) {
		throw new Error("No text detected in the PDF");
	}

	return extractedText.trim();
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
		const [operation] = await visionClient.asyncBatchAnnotateFiles(request);

		// Wait for operation to complete
		const [filesResponse] = await operation.promise();

		if (!filesResponse?.responses?.[0]?.outputConfig?.gcsDestination?.uri) {
			throw new Error("Invalid response from Vision API");
		}

		// Get the JSON results from GCS
		const jsonUri = filesResponse.responses[0].outputConfig.gcsDestination.uri;
		logger.ocr(`PDF processing complete. JSON result saved to: ${jsonUri}`);

		// Extract text from the output files
		const extractedText = await extractTextFromOutput(outputPrefix);

		// Log detailed OCR results after showing extracted text
		const result = await downloadAndParseOutput(outputPrefix);
		if (result) {
			logger.detailedOCR(result, "pdf");
		}

		return extractedText;
	} catch (error) {
		throw new Error(`Failed to perform OCR on PDF ${fileName}: ${error}`);
	} finally {
		// Always cleanup output files
		await deleteGCSOutputFiles(outputPrefix);
	}
}

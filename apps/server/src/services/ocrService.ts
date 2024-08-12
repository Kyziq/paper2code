import vision from "@google-cloud/vision";
import { promises as fs } from "fs";
import path from "path";
import { uploadDir } from "../utils/fileSystem";
import dotenv from "dotenv";
import { logger } from "../utils/logger";
import pc from "picocolors";

dotenv.config({ path: path.resolve(__dirname, "../../../../.env") });

const client = new vision.ImageAnnotatorClient({
  keyFilename: process.env.GCP_SERVICE_ACCOUNT_KEY_PATH,
});

export const handleImage = async (filePath: string): Promise<string> => {
  try {
    const [result] = await client.documentTextDetection(filePath);
    const fullTextAnnotation = result.fullTextAnnotation;

    if (!fullTextAnnotation || !fullTextAnnotation.text) {
      logger.error("No text detected in the image.");
      return "";
    }

    logger.info(`Full text detected: ${fullTextAnnotation.text}`);

    // Detailed logging of OCR results
    logDetailedOCRResults(fullTextAnnotation);

    return fullTextAnnotation.text.trim();
  } catch (error) {
    logger.error(`Failed to perform OCR on image: ${error}`);
    throw new Error("Failed to perform OCR on image");
  }
};

const logDetailedOCRResults = (fullTextAnnotation: any) => {
  console.log("");
  fullTextAnnotation.pages?.forEach((page: any, pageIndex: number) => {
    logger.info(pc.cyan(`----- Page ${pageIndex + 1} -----`));
    page.blocks?.forEach((block: any, blockIndex: number) => {
      logger.info(pc.yellow(`Block ${blockIndex + 1} - Confidence: ${block.confidence.toFixed(2)}`));
      block.paragraphs?.forEach((paragraph: any, paragraphIndex: number) => {
        logger.info(pc.green(`\tParagraph ${paragraphIndex + 1} - Confidence: ${paragraph.confidence.toFixed(2)}`));
        paragraph.words?.forEach((word: any, wordIndex: number) => {
          const wordText = word.symbols?.map((s: any) => s.text).join("") ?? "";
          logger.info(pc.blue(`\t\tWord ${wordIndex + 1}: ${wordText} - Confidence: ${word.confidence.toFixed(2)}`));
          word.symbols?.forEach((symbol: any, symbolIndex: number) => {
            logger.info(pc.magenta(`\t\t\tSymbol ${symbolIndex + 1}: ${symbol.text} - Confidence: ${symbol.confidence.toFixed(2)}`));
          });
        });
      });
    });
  });
  console.log("");
};

export const handlePDF = async (filePath: string): Promise<string> => {
  // TODO: Implement PDF handling logic
  throw new Error("PDF handling not implemented yet");
};

export const performOCR = async (file: File): Promise<string> => {
  const arrayBuffer = await file.arrayBuffer();
  const uint8Array = new Uint8Array(arrayBuffer);

  const uploadedFilePath = path.resolve(uploadDir, file.name);
  await fs.writeFile(uploadedFilePath, uint8Array);
  logger.info(`File saved to: ${uploadedFilePath}`);

  try {
    const text = file.type === "application/pdf" ? await handlePDF(uploadedFilePath) : await handleImage(uploadedFilePath);

    await fs.unlink(uploadedFilePath);
    logger.info(`File deleted: ${uploadedFilePath}`);

    return text;
  } catch (error) {
    await fs.unlink(uploadedFilePath).catch(logger.error);
    logger.error(`An error occurred during OCR processing: ${error}`);
    throw error;
  }
};

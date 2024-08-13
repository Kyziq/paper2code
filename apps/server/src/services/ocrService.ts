import vision from "@google-cloud/vision";
import path from "path";
import dotenv from "dotenv";
import { logger } from "../utils/logger";
import { Storage } from "@google-cloud/storage";

dotenv.config({ path: path.resolve(__dirname, "../../../../.env") });

const client = new vision.ImageAnnotatorClient({
  keyFilename: process.env.GCP_SERVICE_ACCOUNT_KEY_PATH,
});
const storage = new Storage({
  keyFilename: process.env.GCP_SERVICE_ACCOUNT_KEY_PATH,
});

const bucketName = process.env.GCP_STORAGE_BUCKET_NAME!;
const storageClass = process.env.GCP_STORAGE_CLASS!;
const location = process.env.GCP_STORAGE_LOCATION!;

async function createBucketIfNotExists() {
  try {
    const [bucketExists] = await storage.bucket(bucketName).exists();
    if (!bucketExists) {
      const [bucket] = await storage.createBucket(bucketName, {
        location,
        [storageClass]: true,
      });
      logger.info(`Bucket ${bucket.name} created with ${storageClass} class in ${location}`);
    } else {
      logger.info(`Using bucket ${bucketName} that has been created previously`);
    }
  } catch (error) {
    logger.error(`Error creating/checking bucket: ${error}`);
    throw error;
  }
}

export const handleImage = async (fileName: string): Promise<string> => {
  try {
    const [result] = await client.documentTextDetection(`gs://${bucketName}/${fileName}`);
    const fullTextAnnotation = result.fullTextAnnotation;

    if (!fullTextAnnotation || !fullTextAnnotation.text) {
      logger.error("No text detected in the image.");
      return "";
    }

    logger.info(`Full text detected: ${fullTextAnnotation.text}`);
    logger.logDetailedOCRResults(fullTextAnnotation, "image");
    return fullTextAnnotation.text.trim();
  } catch (error) {
    logger.error(`Failed to perform OCR on image: ${error}`);
    throw new Error("Failed to perform OCR on image");
  }
};

export const handlePDF = async (filePath: string): Promise<string> => {
  // TODO: Implement PDF handling logic
  throw new Error("PDF handling not implemented yet");
};

export const performOCR = async (file: File): Promise<string> => {
  try {
    await createBucketIfNotExists();

    const bucket = storage.bucket(bucketName);
    const blob = bucket.file(file.name);

    // Get the array buffer of the file
    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);

    // Upload the file to Google Cloud Storage
    await blob.save(buffer, {
      contentType: file.type,
    });
    logger.info(`File uploaded to bucket: ${file.name}`);

    // Perform OCR
    const text = file.type === "application/pdf" ? await handlePDF(file.name) : await handleImage(file.name);

    return text;
  } catch (error) {
    logger.error(`An error occurred during OCR processing: ${error}`);
    throw error;
  } finally {
    // Ensure attempt to delete the file whether OCR succeeds or fails
    try {
      await storage.bucket(bucketName).file(file.name).delete();
      logger.info(`File deleted from bucket}: ${file.name}`);
    } catch (deleteError) {
      logger.error(`Failed to delete file from bucket: ${deleteError}`);
    }
  }
};

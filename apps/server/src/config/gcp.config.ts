import vision from "@google-cloud/vision";
import { S3Client } from "bun";

// Configure bucket settings
export const gcpConfig = {
	bucket: {
		name: Bun.env.GCP_STORAGE_BUCKET_NAME ?? "",
		storageClass: Bun.env.GCP_STORAGE_CLASS ?? "",
		region: Bun.env.GCP_STORAGE_REGION ?? "",
	},
};

// Initialize S3 client for GCS using HMAC credentials
export const s3Client = new S3Client({
	bucket: gcpConfig.bucket.name,
	endpoint: "https://storage.googleapis.com",
	// Use HMAC credentials for S3-compatible access
	accessKeyId: Bun.env.GCP_HMAC_ACCESS_KEY_ID,
	secretAccessKey: Bun.env.GCP_HMAC_SECRET_ACCESS_KEY,
	// Optional: Additional GCS-specific settings
	region: gcpConfig.bucket.region,
});

// Initialize Vision API client using service account
export const visionClient = new vision.ImageAnnotatorClient({
	keyFilename: Bun.env.GCP_SERVICE_ACCOUNT_KEY_PATH,
});

import { Storage } from "@google-cloud/storage";
import vision from "@google-cloud/vision";

export const gcpConfig = {
	keyFilename: Bun.env.GCP_SERVICE_ACCOUNT_KEY_PATH,
	bucket: {
		name: Bun.env.GCP_STORAGE_BUCKET_NAME ?? "",
		storageClass: Bun.env.GCP_STORAGE_CLASS ?? "",
		location: Bun.env.GCP_STORAGE_LOCATION ?? "",
	},
};

export const visionClient = new vision.ImageAnnotatorClient({
	keyFilename: gcpConfig.keyFilename,
});

export const storageClient = new Storage({
	keyFilename: gcpConfig.keyFilename,
});

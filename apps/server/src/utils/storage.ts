import { gcpConfig, storageClient } from "~/config/gcp.config";
import { logger } from "./logger";

export async function createBucketIfNotExists(): Promise<void> {
	const { name, location, storageClass } = gcpConfig.bucket;

	logger.info(`Checking if bucket ${name} exists`);
	try {
		const [bucketExists] = await storageClient.bucket(name).exists();
		if (!bucketExists) {
			logger.info(`Bucket ${name} does not exist. Creating...`);
			const [bucket] = await storageClient.createBucket(name, {
				location,
				[storageClass]: true,
			});
			logger.success(
				`Bucket ${bucket.name} created with ${storageClass} class in ${location}`,
			);
		}
	} catch (error) {
		logger.error(`Error creating/checking bucket: ${error}`);
		throw error;
	}
}

export async function uploadFile(file: File): Promise<void> {
	const bucket = storageClient.bucket(gcpConfig.bucket.name);
	const blob = bucket.file(file.name);
	const buffer = Buffer.from(await file.arrayBuffer());

	await blob.save(buffer, { contentType: file.type });
	logger.success(`File uploaded to bucket: ${file.name}`);
}

export async function deleteFile(fileName: string): Promise<void> {
	try {
		const bucket = storageClient.bucket(gcpConfig.bucket.name);
		await bucket.file(fileName).delete();
		logger.delete(`File deleted from bucket: ${fileName}`);
	} catch (error) {
		logger.error(`Failed to delete file from bucket: ${error}`);
		throw error;
	}
}

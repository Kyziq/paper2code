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

export async function uploadGCSFile(
	file: File,
): Promise<{ uniqueFileName: string }> {
	// Generate unique file name
	const ext = file.name.split(".").pop();
	const date = new Date();

	// Format: DDMMYYYY_HHMMSS_SSS
	const formattedDate = [
		date.getDate().toString().padStart(2, "0"),
		(date.getMonth() + 1).toString().padStart(2, "0"),
		date.getFullYear(),
	].join("");
	const formattedTime = [
		date.getHours().toString().padStart(2, "0"),
		date.getMinutes().toString().padStart(2, "0"),
		date.getSeconds().toString().padStart(2, "0"),
	].join("");
	const milliseconds = date.getMilliseconds().toString().padStart(3, "0");

	const uniqueFileName = `${formattedDate}_${formattedTime}_${milliseconds}.${ext}`;

	const bucket = storageClient.bucket(gcpConfig.bucket.name);
	const blob = bucket.file(uniqueFileName);
	const buffer = Buffer.from(await file.arrayBuffer());

	await blob.save(buffer, { contentType: file.type });
	logger.success(
		`File uploaded to bucket: ${uniqueFileName} (original: ${file.name})`,
	);

	return { uniqueFileName };
}

// TODO: Delete the file from GCS bucket when no longer needed, maybe need to add session
export async function deleteGCSFile(fileName: string): Promise<void> {
	try {
		const bucket = storageClient.bucket(gcpConfig.bucket.name);
		await bucket.file(fileName).delete();
		logger.delete(`File deleted from bucket: ${fileName}`);
	} catch (error) {
		logger.error(`Failed to delete file from bucket: ${error}`);
		throw error;
	}
}

export async function getPublicUrl(fileName: string): Promise<string> {
	const bucket = storageClient.bucket(gcpConfig.bucket.name);
	const file = bucket.file(fileName);

	// Make the file publicly readable
	await file.makePublic();

	// Get the public URL
	return `https://storage.googleapis.com/${gcpConfig.bucket.name}/${fileName}`;
}

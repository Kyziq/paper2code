import { gcpConfig, s3Client } from "~/config/gcp.config";
import { logger } from "./logger";

export async function uploadFile(
	file: File,
): Promise<{ uniqueFileName: string }> {
	// Generate unique filename with timestamp
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

	// Upload file to bucket
	const s3File = s3Client.file(uniqueFileName);

	try {
		if (file.size > 5 * 1024 * 1024) {
			// 5MB - use streaming for large files
			const writer = s3File.writer({
				type: file.type,
				acl: "public-read",
				// Optimize for large files
				partSize: 5 * 1024 * 1024, // 5MB chunks
				queueSize: 4, // Parallel uploads
				retry: 3, // Auto-retry on network errors
			});

			const stream = file.stream();
			const reader = stream.getReader();

			while (true) {
				const { done, value } = await reader.read();
				if (done) break;
				await writer.write(value);
			}

			await writer.end();
		} else {
			// For smaller files, use simple write
			await s3File.write(file, {
				type: file.type,
				acl: "public-read",
			});
		}

		logger.success(
			`File uploaded to bucket: ${uniqueFileName} (original: ${file.name})`,
		);
		return { uniqueFileName };
	} catch (error) {
		logger.error(`Failed to upload file to bucket: ${error}`);
		throw error;
	}
}

export async function deleteGCSFile(fileName: string): Promise<void> {
	try {
		const s3File = s3Client.file(fileName);
		await s3File.delete();
		logger.delete(`File deleted from bucket: ${fileName}`);
	} catch (error) {
		logger.error(`Failed to delete file from bucket: ${error}`);
		throw error;
	}
}

export async function getPublicUrl(fileName: string): Promise<string> {
	const { name } = gcpConfig.bucket;

	try {
		// First check if the file exists
		const s3File = s3Client.file(fileName);
		const exists = await s3File.exists();
		if (!exists) {
			throw new Error(`File not found in bucket: ${fileName}`);
		}

		// Return direct public URL
		return `https://storage.googleapis.com/${name}/${fileName}`;
	} catch (error) {
		logger.error(`Failed to generate public URL for ${fileName}: ${error}`);
		throw error;
	}
}

import path from "node:path";

export const FILE_SIZE_LIMITS = {
	"application/pdf": 5 * 1024 * 1024, // 5MB for PDFs
	"image/*": 5 * 1024 * 1024, // 5MB for images
};
export const ALLOWED_FILE_TYPES = [
	"image/jpg",
	"image/jpeg",
	"image/png",
	"application/pdf",
];
export const TEMP_DIR = path.resolve(__dirname, "../../temp");

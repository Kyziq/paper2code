export const SUPPORTED_FILE_TYPES = {
	PDF: "application/pdf",
	JPG: "image/jpg",
	JPEG: "image/jpeg",
	PNG: "image/png",
} as const;

export type SupportedMimeType =
	(typeof SUPPORTED_FILE_TYPES)[keyof typeof SUPPORTED_FILE_TYPES];

export const MAX_FILE_SIZES = {
	[SUPPORTED_FILE_TYPES.PDF]: 5 * 1024 * 1024,
	"image/*": 5 * 1024 * 1024,
} as const;

export const ACCEPTED_FILE_EXTENSIONS = {
	"image/*": [".png", ".jpg", ".jpeg"],
	[SUPPORTED_FILE_TYPES.PDF]: [".pdf"],
} as const;

export const SUPPORTED_LANGUAGES = [{ value: "cpp", label: "C++" }] as const;

export type SupportedLanguage = (typeof SUPPORTED_LANGUAGES)[number]["value"];
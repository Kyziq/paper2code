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
	[SUPPORTED_FILE_TYPES.JPG]: 5 * 1024 * 1024,
	[SUPPORTED_FILE_TYPES.JPEG]: 5 * 1024 * 1024,
	[SUPPORTED_FILE_TYPES.PNG]: 5 * 1024 * 1024,
} as const;

export const ACCEPTED_FILE_EXTENSIONS = {
	"image/*": [".png", ".jpg", ".jpeg"],
	[SUPPORTED_FILE_TYPES.PDF]: [".pdf"],
} as const;

export const SUPPORTED_LANGUAGES = [
	{
		value: "cpp",
		label: "C++",
		icon: "/assets/icons/cpp.svg",
	},
	{
		value: "java",
		label: "Java",
		icon: "/assets/icons/java.svg",
	},
	{
		value: "python",
		label: "Python",
		icon: "/assets/icons/python.svg",
	},
] as const;

export type SupportedLanguage = (typeof SUPPORTED_LANGUAGES)[number]["value"];

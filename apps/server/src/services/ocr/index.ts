import { gcpConfig } from "~/config/gcp.config";
import { logger } from "~/utils/logger";
import { getPublicUrl, uploadFile } from "~/utils/storage";
import type { SupportedLanguage } from "~shared/constants";
import { processImage } from "./handlers/image";
import { processPDF } from "./handlers/pdf";

// Test mode configuration
const TEST_MODE = Bun.env.USE_TEST_MODE === "true";

interface TestData {
	code: string;
	fileUrl: string;
}

// Simple base64 encoded test images - these are just basic SVGs
const TEST_IMAGES = {
	cpp: "data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNDAwIiBoZWlnaHQ9IjIwMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cmVjdCB3aWR0aD0iMTAwJSIgaGVpZ2h0PSIxMDAlIiBmaWxsPSJ3aGl0ZSIvPjx0ZXh0IHg9IjEwIiB5PSIzMCIgZm9udC1mYW1pbHk9Im1vbm9zcGFjZSIgZm9udC1zaXplPSIxNCI+I2luY2x1ZGUgJmx0O2lvc3RyZWFtJmd0OzwvdGV4dD48dGV4dCB4PSIxMCIgeT0iNTAiIGZvbnQtZmFtaWx5PSJtb25vc3BhY2UiIGZvbnQtc2l6ZT0iMTQiPnVzaW5nIG5hbWVzcGFjZSBzdGQ7PC90ZXh0Pjx0ZXh0IHg9IjEwIiB5PSI4MCIgZm9udC1mYW1pbHk9Im1vbm9zcGFjZSIgZm9udC1zaXplPSIxNCI+aW50IG1haW4oKSB7PC90ZXh0Pjx0ZXh0IHg9IjMwIiB5PSIxMDAiIGZvbnQtZmFtaWx5PSJtb25vc3BhY2UiIGZvbnQtc2l6ZT0iMTQiPmNvdXQgJmx0OyZsdDsgIkhlbGxvIFdvcmxkIGZyb20gQysrIjs8L3RleHQ+PHRleHQgeD0iMTAiIHk9IjEyMCIgZm9udC1mYW1pbHk9Im1vbm9zcGFjZSIgZm9udC1zaXplPSIxNCI+cmV0dXJuIDA7PC90ZXh0Pjx0ZXh0IHg9IjEwIiB5PSIxNDAiIGZvbnQtZmFtaWx5PSJtb25vc3BhY2UiIGZvbnQtc2l6ZT0iMTQiPn08L3RleHQ+PC9zdmc+",
	java: "data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNDAwIiBoZWlnaHQ9IjIwMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cmVjdCB3aWR0aD0iMTAwJSIgaGVpZ2h0PSIxMDAlIiBmaWxsPSJ3aGl0ZSIvPjx0ZXh0IHg9IjEwIiB5PSIzMCIgZm9udC1mYW1pbHk9Im1vbm9zcGFjZSIgZm9udC1zaXplPSIxNCI+cHVibGljIGNsYXNzIE1haW4gezwvdGV4dD48dGV4dCB4PSIzMCIgeT0iNjAiIGZvbnQtZmFtaWx5PSJtb25vc3BhY2UiIGZvbnQtc2l6ZT0iMTQiPnB1YmxpYyBzdGF0aWMgdm9pZCBtYWluKFN0cmluZ1tdIGFyZ3MpIHs8L3RleHQ+PHRleHQgeD0iNTAiIHk9IjkwIiBmb250LWZhbWlseT0ibW9ub3NwYWNlIiBmb250LXNpemU9IjE0Ij5TeXN0ZW0ub3V0LnByaW50bG4oIkhlbGxvIFdvcmxkIGZyb20gSmF2YSIpOzwvdGV4dD48dGV4dCB4PSIzMCIgeT0iMTIwIiBmb250LWZhbWlseT0ibW9ub3NwYWNlIiBmb250LXNpemU9IjE0Ij59PC90ZXh0Pjx0ZXh0IHg9IjEwIiB5PSIxNTAiIGZvbnQtZmFtaWx5PSJtb25vc3BhY2UiIGZvbnQtc2l6ZT0iMTQiPn08L3RleHQ+PC9zdmc+",
	python:
		"data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNDAwIiBoZWlnaHQ9IjEwMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cmVjdCB3aWR0aD0iMTAwJSIgaGVpZ2h0PSIxMDAlIiBmaWxsPSJ3aGl0ZSIvPjx0ZXh0IHg9IjEwIiB5PSIzMCIgZm9udC1mYW1pbHk9Im1vbm9zcGFjZSIgZm9udC1zaXplPSIxNCI+cHJpbnQoIkhlbGxvIFdvcmxkIGZyb20gUHl0aG9uIik8L3RleHQ+PC9zdmc+",
};

const TEST_CODE: Record<SupportedLanguage, TestData> = {
	cpp: {
		code: `#include <iostream>
using namespace std;

int main() {
    cout << "Hello World from C++" << endl;
    return 0;
}`,
		fileUrl: TEST_IMAGES.cpp,
	},
	java: {
		code: `public class Main {
    public static void main(String[] args) {
        System.out.println("Hello World from Java");
    }
}`,
		fileUrl: TEST_IMAGES.java,
	},
	python: {
		code: `print("Hello World from Python")`,
		fileUrl: TEST_IMAGES.python,
	},
};

export async function processOCR(
	file: File,
): Promise<{ code: string; fileUrl: string }> {
	logger.ocr(`Starting OCR process for file: ${file.name}`);

	// Default to Python for test mode
	if (TEST_MODE) {
		logger.ocr("🧪 Test mode active - bypassing OCR");
		const testData = TEST_CODE["python" as SupportedLanguage];
		logger.ocr("Returning test code");
		logger.ocr(testData.code);
		return {
			code: testData.code,
			fileUrl: testData.fileUrl, // Base64 encoded SVG
		};
	}

	// Log GCS bucket info
	logger.info(
		`Using GCS bucket: ${gcpConfig.bucket.name} (${gcpConfig.bucket.storageClass} in ${gcpConfig.bucket.region})`,
	);

	// Upload file and get unique filename
	const { uniqueFileName } = await uploadFile(file);

	// Get the public URL for the uploaded file
	const fileUrl = await getPublicUrl(uniqueFileName);

	const result =
		file.type === "application/pdf"
			? await processPDF(uniqueFileName)
			: await processImage(uniqueFileName);

	logger.ocr(`OCR process completed successfully for file: ${uniqueFileName}`);
	logger.ocr(`Returning code:\n${result}`);
	logger.ocr(`Returning fileUrl: ${fileUrl}`);
	return {
		code: result,
		fileUrl,
	};
}

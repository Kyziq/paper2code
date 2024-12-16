import { logger } from "~/utils/logger";
import {
	createBucketIfNotExists,
	deleteGCSFile,
	uploadGCSFile,
} from "~/utils/storage";
import type { SupportedLanguage } from "~shared/constants";
import { processImage } from "./handlers/image";
import { processPDF } from "./handlers/pdf";

// Test mode configuration
const TEST_MODE = Bun.env.USE_TEST_MODE === "true";

const TEST_CODE = {
	cpp: `#include <iostream>
using namespace std;

int main() {
    cout << "Hello World from C++" << endl;
    return 0;
}`,
	java: `public class Main {
    public static void main(String[] args) {
        System.out.println("Hello World from Java");
    }
}`,
	python: `print("Hello World from Python")`,
};

export async function processOCR(
	file: File,
	language: SupportedLanguage,
): Promise<string> {
	logger.ocr(`Starting OCR process for file: ${file.name}`);

	// If in test mode, return test code based on selected language
	if (TEST_MODE) {
		logger.ocr("🧪 Test mode active - bypassing OCR");
		const testCode = TEST_CODE[language];
		logger.ocr(`Returning test ${language.toUpperCase()} code`);
		logger.ocr(testCode);
		return testCode;
	}
	try {
		await createBucketIfNotExists();
		await uploadGCSFile(file);

		const result =
			file.type === "application/pdf"
				? await processPDF(file.name)
				: await processImage(file.name);

		logger.success(`OCR process completed successfully for ${file.name}`);
		return result;
	} finally {
		if (!TEST_MODE) {
			await deleteGCSFile(file.name);
		}
	}
}

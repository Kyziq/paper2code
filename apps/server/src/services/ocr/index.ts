import { logger } from "~/utils/logger";
import {
	createBucketIfNotExists,
	deleteGCSFile,
	getPublicUrl,
	uploadGCSFile,
} from "~/utils/storage";
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
// You can replace these with actual handwritten code image base64 strings
const TEST_IMAGES = {
	cpp: `data:image/svg+xml;base64,${Buffer.from(`
    <svg width="400" height="200" xmlns="http://www.w3.org/2000/svg">
      <rect width="100%" height="100%" fill="white"/>
      <text x="10" y="30" font-family="monospace" font-size="14">
        #include &lt;iostream&gt;
      </text>
      <text x="10" y="50" font-family="monospace" font-size="14">
        using namespace std;
      </text>
      <text x="10" y="80" font-family="monospace" font-size="14">
        int main() {
      </text>
      <text x="30" y="100" font-family="monospace" font-size="14">
        cout << "Hello World from C++";
      </text>
      <text x="10" y="120" font-family="monospace" font-size="14">
        return 0;
      </text>
      <text x="10" y="140" font-family="monospace" font-size="14">
        }
      </text>
    </svg>
  `).toString("base64")}`,

	java: `data:image/svg+xml;base64,${Buffer.from(`
    <svg width="400" height="200" xmlns="http://www.w3.org/2000/svg">
      <rect width="100%" height="100%" fill="white"/>
      <text x="10" y="30" font-family="monospace" font-size="14">
        public class Main {
      </text>
      <text x="30" y="60" font-family="monospace" font-size="14">
        public static void main(String[] args) {
      </text>
      <text x="50" y="90" font-family="monospace" font-size="14">
        System.out.println("Hello World from Java");
      </text>
      <text x="30" y="120" font-family="monospace" font-size="14">
        }
      </text>
      <text x="10" y="150" font-family="monospace" font-size="14">
        }
      </text>
    </svg>
  `).toString("base64")}`,

	python: `data:image/svg+xml;base64,${Buffer.from(`
    <svg width="400" height="100" xmlns="http://www.w3.org/2000/svg">
      <rect width="100%" height="100%" fill="white"/>
      <text x="10" y="30" font-family="monospace" font-size="14">
        print("Hello World from Python")
      </text>
    </svg>
  `).toString("base64")}`,
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
	language: SupportedLanguage,
): Promise<{ code: string; fileUrl: string }> {
	logger.ocr(`Starting OCR process for file: ${file.name}`);

	// If in test mode, return test code based on selected language
	if (TEST_MODE) {
		logger.ocr("🧪 Test mode active - bypassing OCR");
		const testData = TEST_CODE[language];
		logger.ocr(`Returning test ${language.toUpperCase()} code`);
		logger.ocr(testData.code);
		return {
			code: testData.code,
			fileUrl: testData.fileUrl,
		};
	}
	await createBucketIfNotExists();

	// Upload file and get unique filename
	const { uniqueFileName } = await uploadGCSFile(file);

	// Get the public URL for the uploaded file
	const fileUrl = await getPublicUrl(uniqueFileName);

	const result =
		file.type === "application/pdf"
			? await processPDF(uniqueFileName)
			: await processImage(uniqueFileName);

	logger.ocr(`OCR process completed successfully for file: ${uniqueFileName}`);
	logger.ocr(`Returning code: ${result}`);
	logger.ocr(`Returning fileUrl: ${fileUrl}`);
	return {
		code: result,
		fileUrl,
	};
}

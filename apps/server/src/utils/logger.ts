import type { protos } from "@google-cloud/vision";
import pc from "picocolors";

type FullTextAnnotation = protos.google.cloud.vision.v1.ITextAnnotation;

class Logger {
	info(message: string): void {
		console.log(pc.cyan(`💡 [INFO] ${message}`));
	}

	success(message: string): void {
		console.log(pc.green(`✅ [SUCCESS] ${message}`));
	}

	warning(message: string): void {
		console.log(pc.yellow(`⚠️ [WARNING] ${message}`));
	}

	error(message: string): void {
		console.error(pc.red(`❌ [ERROR] ${message}`));
	}

	debug(message: string): void {
		console.log(pc.gray(`🐛 [DEBUG] ${message}`));
	}

	api(message: string): void {
		console.log(pc.cyan(`🔗 [API] ${message}`));
	}

	ocr(message: string): void {
		console.log(pc.magenta(`🔍 [OCR] ${message}`));
	}

	docker(message: string): void {
		console.log(pc.blue(`🐳 [DOCKER] ${message}`));
	}

	delete(message: string): void {
		console.log(pc.cyan(`🗑️  [DELETE] ${message}`));
	}

	logDetailedOCRResults(
		fullTextAnnotation: FullTextAnnotation,
		type: "image" | "pdf",
	): void {
		console.log("");
		this.info(
			pc.bgCyan(
				pc.black(`----- Detailed OCR Results (${type.toUpperCase()}) -----`),
			),
		);
		fullTextAnnotation.pages?.forEach((page, pageIndex) => {
			this.info(pc.bgWhite(pc.black(`----- Page ${pageIndex + 1} -----`)));
			page.blocks?.forEach((block, blockIndex) => {
				console.log(
					pc.bgYellow(
						pc.black(
							`Block ${blockIndex + 1} - Confidence: ${block.confidence?.toFixed(2) ?? "N/A"}`,
						),
					),
				);
				block.paragraphs?.forEach((paragraph, paragraphIndex) => {
					console.log(
						pc.bgGreen(
							pc.black(
								`  Paragraph ${paragraphIndex + 1} - Confidence: ${paragraph.confidence?.toFixed(2) ?? "N/A"}`,
							),
						),
					);
					paragraph.words?.forEach((word, wordIndex) => {
						const wordText = word.symbols?.map((s) => s.text).join("") ?? "";
						console.log(
							pc.bgBlue(
								pc.white(
									`    Word ${wordIndex + 1}: ${wordText} - Confidence: ${word.confidence?.toFixed(2) ?? "N/A"}`,
								),
							),
						);
						word.symbols?.forEach((symbol, symbolIndex) => {
							console.log(
								pc.bgMagenta(
									pc.white(
										`      Symbol ${symbolIndex + 1}: ${symbol.text} - Confidence: ${symbol.confidence?.toFixed(2) ?? "N/A"}`,
									),
								),
							);
						});
					});
				});
			});
		});
		console.log("");
	}
}

export const logger = new Logger();

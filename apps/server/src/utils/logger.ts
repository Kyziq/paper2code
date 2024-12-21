import path from "node:path";
import type { protos } from "@google-cloud/vision";
import pc from "picocolors";
import { formatTimestamp } from "~shared/utils/formatting";

type LogLevel =
	| "info"
	| "warn"
	| "error"
	| "success"
	| "debug"
	| "api"
	| "ocr"
	| "docker"
	| "delete";

type ITextAnnotation = protos.google.cloud.vision.v1.ITextAnnotation;
type IAnnotateFileResponse =
	protos.google.cloud.vision.v1.IAnnotateFileResponse;

const logConfig = {
	styles: {
		info: { icon: "💡", color: pc.cyan },
		warn: { icon: "⚠️", color: pc.yellow },
		error: { icon: "❌", color: pc.red },
		success: { icon: "✅", color: pc.green },
		debug: { icon: "🐛", color: pc.gray },
		api: { icon: "🔗", color: pc.blue },
		ocr: { icon: "🔍", color: pc.magenta },
		docker: { icon: "🐳", color: pc.cyan },
		delete: { icon: "🗑️", color: pc.red },
	},
	isProd: import.meta.env?.PROD,
};

class Logger {
	private getTimestamp() {
		return pc.dim(formatTimestamp(new Date(), { showMilliseconds: true }));
	}

	private log(level: LogLevel, message: unknown) {
		if (logConfig.isProd) return;
		const { icon, color } = logConfig.styles[level];
		const prefix = `${icon} ${color(pc.bold(`[${level.toUpperCase()}]`))}`;
		const formattedMessage = `${this.getTimestamp()} ${prefix} ${message}`;
		console[level === "error" ? "error" : "log"](formattedMessage);
	}

	info = (message: unknown) => this.log("info", message);
	warn = (message: unknown) => this.log("warn", message);
	error = (message: unknown) => this.log("error", message);
	success = (message: unknown) => this.log("success", message);
	debug = (message: unknown) => this.log("debug", message);
	api = (message: unknown) => this.log("api", message);
	ocr = (message: unknown) => this.log("ocr", message);
	docker = (message: unknown) => this.log("docker", message);
	delete = (message: unknown) => this.log("delete", message);

	detailedOCR(
		data: ITextAnnotation | IAnnotateFileResponse,
		sourceType: "image" | "pdf",
	) {
		if (logConfig.isProd) return;
		console.log("");
		this.info(
			pc.cyan(`----- OCR Result for ${sourceType.toUpperCase()} -----`),
		);

		const pages =
			sourceType === "image"
				? (data as ITextAnnotation).pages
				: (data as IAnnotateFileResponse).responses?.[0]?.fullTextAnnotation
						?.pages;

		if (!pages) {
			this.warn("No pages found in OCR result");
			return;
		}

		pages.forEach((page, pageIdx) => {
			// if (pageIdx > 0) {
			// 		console.log(pc.cyan(`\n----- Page ${pageIdx + 1} -----`));
			// }

			page.blocks?.forEach((block, blockIdx) => {
				console.log(
					pc.blue(
						`Block ${blockIdx + 1} - Confidence: ${this.formatConfidence(
							block.confidence,
						)}`,
					),
				);

				block.paragraphs?.forEach((paragraph, paragraphIndex) => {
					console.log(
						pc.magenta(
							`  Paragraph ${paragraphIndex + 1} - Confidence: ${this.formatConfidence(
								paragraph.confidence,
							)}`,
						),
					);

					paragraph.words?.forEach((word, wordIndex) => {
						const wordText = word.symbols?.map((s) => s.text).join("") ?? "";
						console.log(
							pc.gray(
								`    Word ${wordIndex + 1}: ${pc.white(wordText)} - Confidence: ${this.formatConfidence(word.confidence)}`,
							),
						);

						word.symbols?.forEach((symbol, symbolIndex) => {
							const breakInfo = symbol.property?.detectedBreak?.type
								? ` [${symbol.property.detectedBreak.type}]`
								: "";
							console.log(
								pc.gray(
									`      Symbol ${symbolIndex + 1}: ${pc.white(symbol.text)} - Confidence: ${this.formatConfidence(symbol.confidence)}${breakInfo}`,
								),
							);
						});
					});
				});
			});
		});
		console.log("");
	}

	private formatConfidence(confidence: number | null | undefined): string {
		return confidence?.toFixed(2) ?? "N/A";
	}
}

export const logger = new Logger();

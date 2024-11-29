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
	// Base directory to show relative paths from
	baseDir: path.resolve("apps/server"),
};

class Logger {
	private formatPath(filepath: string): string {
		try {
			// Convert absolute path to relative path from baseDir
			const relativePath = path.relative(logConfig.baseDir, filepath);

			// If the path is still too long, show just the last 2-3 segments
			if (relativePath.length > 50) {
				const parts = relativePath.split(path.sep);
				return pc.dim(`.../${parts.slice(-2).join("/")}`);
			}

			return pc.dim(relativePath);
		} catch {
			// If there's any error in path processing, return the original
			return filepath;
		}
	}

	private formatFilename(filename: string): string {
		// Common file patterns
		const filePatterns = [
			/^[\w-]+\.(?:jpg|jpeg|png|gif|pdf)$/i, // Image/PDF files
			/^[\w-]+_\d+\.[\w]+$/i, // Files with timestamps
			/^ocr_result_\d+\.[\w]+$/i, // OCR result files
		];

		if (filePatterns.some((pattern) => pattern.test(filename))) {
			// Make filenames stand out with bold and a different color
			return pc.bold(pc.blue(filename));
		}

		return pc.dim(filename);
	}

	private getTimestamp() {
		return pc.dim(formatTimestamp(new Date(), { showMilliseconds: true }));
	}

	private formatMessage(message: unknown): string {
		const messageStr = typeof message !== "string" ? String(message) : message;

		// First handle full paths
		const withFormattedPaths = messageStr.replace(
			/(^|[^\\])([A-Z]:\\(?:[^\\]+\\)*[^\\]+)/g,
			(_: string, prefix: string, filepath: string) =>
				prefix + this.formatPath(filepath),
		);

		// Then handle filenames
		return withFormattedPaths.replace(
			/(?:^|\s|\/)([\w-]+(?:_\d+)?\.[\w]+)(?=\s|$|\/)/g,
			(matchStr: string, filename: string, offset: number) => {
				// Preserve any leading whitespace/characters
				const prefix = matchStr.substring(0, matchStr.indexOf(filename));
				return prefix + this.formatFilename(filename);
			},
		);
	}

	private log(level: LogLevel, message: unknown) {
		if (logConfig.isProd) return;
		const { icon, color } = logConfig.styles[level];
		const prefix = `${icon} ${color(pc.bold(`[${level.toUpperCase()}]`))}`;
		const formattedMessage = `${this.getTimestamp()} ${prefix} ${this.formatMessage(message)}`;
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
						const confidence = this.getConfidenceColor(word.confidence);
						console.log(
							pc.gray(
								`    Word ${wordIndex + 1}: ${pc.white(wordText)} - Confidence: ${confidence}`,
							),
						);

						word.symbols?.forEach((symbol, symbolIndex) => {
							const symbolConfidence = this.getConfidenceColor(
								symbol.confidence,
							);
							const breakInfo = symbol.property?.detectedBreak?.type
								? ` [${symbol.property.detectedBreak.type}]`
								: "";
							console.log(
								pc.gray(
									`      Symbol ${symbolIndex + 1}: ${pc.white(symbol.text)} - Confidence: ${symbolConfidence}${breakInfo}`,
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

	private getConfidenceColor(confidence: number | null | undefined): string {
		if (!confidence) return pc.yellow("N/A");

		if (confidence >= 0.9) {
			return pc.green(confidence.toFixed(2));
		}
		if (confidence >= 0.7) {
			return pc.yellow(confidence.toFixed(2));
		}
		return pc.red(confidence.toFixed(2));
	}
}

export const logger = new Logger();

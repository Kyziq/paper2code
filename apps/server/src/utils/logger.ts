import type { protos } from "@google-cloud/vision";
import pc from "picocolors";

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
type FullTextAnnotation = protos.google.cloud.vision.v1.ITextAnnotation;

const logConfig = {
	styles: {
		info: { icon: "💡", color: pc.cyan },
		warn: { icon: "⚠️", color: pc.yellow },
		error: { icon: "❌", color: pc.red },
		success: { icon: "✅", color: pc.green },
		debug: { icon: "🐛", color: pc.gray },
		api: { icon: "🔗", color: pc.blue },
		ocr: { icon: "🔍", color: pc.magenta },
		docker: { icon: "🐳", color: pc.magenta },
		delete: { icon: "🗑️", color: pc.red },
	},
	isProd: import.meta.env?.PROD,
};

class Logger {
	private getTimestamp() {
		const now = new Date();

		const date = [
			now.getDate().toString().padStart(2, "0"),
			(now.getMonth() + 1).toString().padStart(2, "0"),
			now.getFullYear(),
		].join("/");

		const hours = now.getHours();
		const ampm = hours >= 12 ? "PM" : "AM";
		const hour12 = hours % 12 || 12;

		const time = [
			hour12,
			now.getMinutes().toString().padStart(2, "0"),
			now.getSeconds().toString().padStart(2, "0"),
		].join(":");

		const ms = now.getMilliseconds().toString().padStart(3, "0");

		return pc.gray(`[${date} | ${time}.${ms} ${ampm}]`);
	}

	private log(level: LogLevel, message: unknown) {
		if (logConfig.isProd) return;

		const { icon, color } = logConfig.styles[level];
		const prefix = `${icon} ${pc.bold(`[${level.toUpperCase()}]`)}`;
		const formattedMessage = `${this.getTimestamp()} ${color(prefix)} ${message}`;

		console[level === "error" ? "error" : "log"](formattedMessage);
	}

	info = (message: string) => this.log("info", message);
	warn = (message: string) => this.log("warn", message);
	error = (message: string) => this.log("error", message);
	success = (message: string) => this.log("success", message);
	debug = (message: string) => this.log("debug", message);
	api = (message: string) => this.log("api", message);
	ocr = (message: string) => this.log("ocr", message);
	docker = (message: string) => this.log("docker", message);
	delete = (message: string) => this.log("delete", message);

	logOCR(data: FullTextAnnotation, type: "image" | "pdf") {
		if (logConfig.isProd) return;

		console.log("");
		this.info(
			pc.bgCyan(pc.black(`----- OCR Results (${type.toUpperCase()}) -----`)),
		);

		data.pages?.forEach((page, pageIdx) => {
			this.info(pc.bgWhite(pc.black(`----- Page ${pageIdx + 1} -----`)));

			page.blocks?.forEach((block, blockIdx) => {
				console.log(
					pc.bgYellow(
						pc.black(
							`Block ${blockIdx + 1} - Confidence: ${block.confidence?.toFixed(2) ?? "N/A"}`,
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

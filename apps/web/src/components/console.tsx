import { cpp } from "@codemirror/lang-cpp";
import { java } from "@codemirror/lang-java";
import { python } from "@codemirror/lang-python";
import { EditorView } from "@uiw/react-codemirror";
import {
	Eye,
	EyeOff,
	Loader2,
	Pencil,
	RotateCcw,
	Terminal,
} from "lucide-react";
import { AnimatePresence, motion, useAnimationControls } from "motion/react";
import { useEffect, useRef, useState } from "react";
import { Badge } from "~/components/ui/badge";
import { Button } from "~/components/ui/button";
import {
	Dialog,
	DialogContent,
	DialogHeader,
	DialogTitle,
} from "~/components/ui/dialog";
import { Toggle } from "~/components/ui/toggle";
import type { SupportedLanguage } from "~shared/constants";
import { CodeEditorWrapper } from "./code-editor-wrapper";

interface ConsoleProps {
	message: string;
	ocrResult?: string;
	fileUrl?: string;
	language?: SupportedLanguage | null;
	isProcessing?: boolean;
	onExecute?: (code: string) => void;
}

export const Console = ({
	message,
	ocrResult,
	fileUrl,
	language,
	isProcessing = false,
	onExecute,
}: ConsoleProps) => {
	const controls = useAnimationControls();

	const consoleRef = useRef<HTMLDivElement>(null);
	const [lines, setLines] = useState<string[]>([]);
	const [isTyping, setIsTyping] = useState(false);
	const [isDialogOpen, setIsDialogOpen] = useState(false);
	const [editableCode, setEditableCode] = useState(ocrResult || "");
	const [isFileVisible, setIsFileVisible] = useState(false);

	useEffect(() => {
		const newLines = message.trim()
			? message.split("\n")
			: ["No output yet. Click the edit button to modify and run the code."];
		setIsTyping(true);
		setLines(newLines);

		if (consoleRef.current) {
			consoleRef.current.scrollTop = consoleRef.current.scrollHeight;
		}

		const timer = setTimeout(
			() => {
				setIsTyping(false);
			},
			newLines.length * 50 + 300,
		);

		return () => clearTimeout(timer);
	}, [message]);

	useEffect(() => {
		setEditableCode(ocrResult || "");
	}, [ocrResult]);

	const handleExecute = () => {
		if (onExecute) {
			onExecute(editableCode);
			setIsDialogOpen(false);
		}
	};

	const handleReset = () => {
		setEditableCode(ocrResult || "");
	};

	const extensions = [
		language === "cpp" ? cpp() : language === "python" ? python() : java(),
		EditorView.lineWrapping,
	];

	const renderOriginalFile = () => {
		if (!fileUrl) {
			return (
				<div className="flex h-full items-center justify-center bg-muted/30 text-muted-foreground">
					<p className="text-sm">No file available</p>
				</div>
			);
		}

		if (fileUrl.toLowerCase().endsWith(".pdf")) {
			return (
				<iframe
					src={fileUrl}
					className="h-full w-full rounded border"
					title="Original PDF"
				/>
			);
		}

		return (
			<div className="flex h-full items-center justify-center rounded bg-muted/30">
				<img
					src={fileUrl}
					alt="Original file"
					className="max-h-full max-w-full rounded object-contain"
				/>
			</div>
		);
	};

	return (
		<div className="relative h-full w-full">
			<motion.div
				initial={{ opacity: 0, y: 20 }}
				animate={{ opacity: 1, y: 0 }}
				transition={{ duration: 0.3 }}
				className="flex h-full w-full flex-col overflow-hidden rounded-lg border bg-zinc-900 font-mono text-zinc-100"
			>
				<motion.div
					className="flex items-center justify-between border-b border-border/50 bg-zinc-800/50 px-4 py-2"
					initial={{ opacity: 0 }}
					animate={{ opacity: 1 }}
					transition={{ delay: 0.2 }}
				>
					<div className="flex items-center gap-3">
						<div className="flex items-center gap-2">
							<Terminal size={16} />
							<span className="font-caskaydiaCoveNerd text-sm font-medium">
								Console Output
							</span>
						</div>
						{language && (
							<Badge
								variant={language}
								showIcon={true}
								className="flex items-center gap-1.5 px-2 py-0.5 text-xs"
							>
								{language.toUpperCase()}
							</Badge>
						)}
					</div>

					<div className="flex items-center gap-2">
						{isProcessing && (
							<div className="flex items-center gap-2 text-xs text-muted-foreground">
								<Loader2 size={14} className="animate-spin" />
								Processing...
							</div>
						)}

						<Button
							size="icon"
							variant="ghost"
							className="h-8 w-8 rounded-full bg-zinc-700/50 hover:bg-zinc-700"
							onClick={() => setIsDialogOpen(true)}
							disabled={isProcessing}
						>
							<Pencil className="h-4 w-4" />
						</Button>
					</div>
				</motion.div>

				<div
					ref={consoleRef}
					className="flex-1 min-h-0 overflow-y-auto bg-zinc-950 p-4 scrollbar-thin scrollbar-track-transparent scrollbar-thumb-zinc-700"
				>
					<AnimatePresence mode="wait">
						{lines.map((line, index) => (
							<motion.div
								key={`${index}-${line}`}
								initial={{ opacity: 0, x: -10 }}
								animate={{ opacity: 1, x: 0 }}
								exit={{ opacity: 0, x: 10 }}
								transition={{ duration: 0.2, delay: index * 0.05 }}
								className="mb-1 flex items-start"
							>
								<span className="mr-2 font-bold text-emerald-400">&gt;</span>
								<span
									className={`font-caskaydiaCoveNerd ${
										message.trim() ? "text-zinc-200" : "text-zinc-500"
									}`}
								>
									{line || " "}
								</span>
								{isTyping && index === lines.length - 1 && (
									<motion.span
										animate={{ opacity: [0, 1, 0] }}
										transition={{
											repeat: Number.POSITIVE_INFINITY,
											duration: 1,
										}}
										className="ml-1 text-primary"
									>
										▋
									</motion.span>
								)}
							</motion.div>
						))}
					</AnimatePresence>
				</div>
			</motion.div>

			<Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
				<DialogContent className="max-w-[90vw] lg:max-w-[85vw] p-0">
					<DialogHeader className="border-b px-4 py-3">
						<div>
							<DialogTitle className="text-base font-medium">
								Code Editor
							</DialogTitle>
						</div>
					</DialogHeader>

					<div className="flex flex-col gap-4 p-4 h-[70vh] lg:flex-row">
						{isFileVisible && (
							<div className="flex-1 flex flex-col min-h-[300px] lg:min-h-0">
								<h3 className="text-sm font-medium mb-2 text-muted-foreground">
									Original File
								</h3>
								<div className="flex-1 overflow-hidden rounded-lg border">
									{renderOriginalFile()}
								</div>
							</div>
						)}

						<div className="flex-1 flex flex-col min-h-[300px] lg:min-h-0">
							<h3 className="text-sm font-medium mb-2 text-muted-foreground">
								Detected Code
							</h3>
							<div className="flex-1 overflow-hidden rounded-lg border h-full">
								<CodeEditorWrapper
									value={editableCode}
									language={language || ""}
									onChange={(value) => setEditableCode(value)}
									extensions={extensions}
									isProcessing={isProcessing}
								/>
							</div>
						</div>
					</div>

					<div className="flex items-center justify-between border-t bg-muted/30 p-4">
						<div className="flex items-center gap-2">
							{/* Toggle Button */}
							<Toggle
								variant="outline"
								aria-label="Toggle preview"
								pressed={isFileVisible}
								onPressedChange={setIsFileVisible}
								className="gap-2"
							>
								<Eye className={isFileVisible ? "h-4 w-4" : "hidden"} />
								<EyeOff className={!isFileVisible ? "h-4 w-4" : "hidden"} />
								<span className="text-sm">Preview</span>
							</Toggle>

							{/* Reset Button */}
							<Button
								variant="outline"
								onClick={() => {
									// Execute reset immediately
									handleReset();
									// Play the animation separately
									controls
										.start({
											rotate: 360,
											transition: {
												duration: 1,
												ease: [0.4, 0, 0.2, 1],
											},
										})
										.then(() => {
											controls.set({ rotate: 0 });
										});
								}}
								disabled={isProcessing}
								className="gap-2"
							>
								<motion.div
									animate={controls}
									whileHover={{ rotate: 45 }}
									transition={{
										duration: 0.3,
										ease: "easeInOut",
									}}
								>
									<RotateCcw size={14} />
								</motion.div>
								Reset Changes
							</Button>
						</div>

						{/* Run Button */}
						<Button
							onClick={handleExecute}
							disabled={isProcessing || !language}
							className="min-w-[100px] gap-2"
						>
							{isProcessing ? (
								<Loader2 size={14} className="animate-spin" />
							) : (
								<Terminal size={14} />
							)}
							Run Code
						</Button>
					</div>
				</DialogContent>
			</Dialog>
		</div>
	);
};

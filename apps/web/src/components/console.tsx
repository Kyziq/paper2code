import { EditorView, type Extension } from "@uiw/react-codemirror";
import {
	Eye,
	EyeOff,
	Loader2,
	Pencil,
	RotateCcw,
	Save,
	Terminal,
} from "lucide-react";
import { AnimatePresence, motion } from "motion/react";
import { useEffect, useRef, useState } from "react";
import { toast } from "sonner";
import { Badge } from "~/components/ui/badge";
import { Button } from "~/components/ui/button";
import {
	Dialog,
	DialogContent,
	DialogHeader,
	DialogTitle,
} from "~/components/ui/dialog";
import { Toggle } from "~/components/ui/toggle";
import { isMobile } from "~/lib/utils";
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

const loadLanguageSupport = async (language: string): Promise<Extension> => {
	try {
		switch (language) {
			case "python":
				return (await import("@codemirror/lang-python")).python();
			case "cpp":
				return (await import("@codemirror/lang-cpp")).cpp();
			case "java":
				return (await import("@codemirror/lang-java")).java();
			default:
				throw new Error(`Unsupported language: ${language}`);
		}
	} catch (error) {
		console.error(`Error loading language support: ${error}`);
		return EditorView.lineWrapping; // Fallback to basic editor
	}
};

export const Console = ({
	message,
	ocrResult,
	fileUrl,
	language,
	isProcessing = false,
	onExecute,
}: ConsoleProps) => {
	const consoleRef = useRef<HTMLDivElement>(null);
	const [output, setOutput] = useState<{ text: string; isError: boolean }[]>(
		[],
	);
	const [isDialogOpen, setIsDialogOpen] = useState(false);
	const [editableCode, setEditableCode] = useState(ocrResult || "");
	const [isFileVisible, setIsFileVisible] = useState(false);
	const [extensions, setExtensions] = useState<Extension[]>([
		EditorView.lineWrapping,
	]);
	const [isLoadingLanguage, setIsLoadingLanguage] = useState(false);
	const [isSaving, setIsSaving] = useState(false);

	// Handle language support loading
	useEffect(() => {
		if (!language) return;

		const loadLanguage = async () => {
			setIsLoadingLanguage(true);
			try {
				const languageSupport = await loadLanguageSupport(language);
				setExtensions([languageSupport, EditorView.lineWrapping]);
			} catch (error) {
				console.error("Failed to load language support:", error);
				// Fallback to basic editor
				setExtensions([EditorView.lineWrapping]);
			} finally {
				setIsLoadingLanguage(false);
			}
		};

		loadLanguage();
	}, [language]);

	useEffect(() => {
		if (!message.trim()) {
			setOutput([
				{
					text: "No output.",
					isError: false,
				},
			]);
			return;
		}

		// Check if the message contains error indicators
		const hasError =
			message.includes("error:") ||
			message.includes("Error:") ||
			message.includes("Traceback") ||
			message.includes("SyntaxError:") ||
			message.includes("NameError:") ||
			message.includes("TypeError:");

		if (hasError) {
			// Treat the entire message as one error block
			setOutput([{ text: message, isError: true }]);
		} else {
			// Split normal output into lines
			const lines = message
				.split("\n")
				.filter((line) => line.trim())
				.map((line) => ({
					text: line,
					isError: false,
				}));
			setOutput(lines);
		}

		if (consoleRef.current) {
			consoleRef.current.scrollTop = consoleRef.current.scrollHeight;
		}
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

	const handleSave = async () => {
		if (!language || !ocrResult) {
			toast.error("Missing code or language");
			return;
		}

		setIsSaving(true);
		try {
			// TODO: implement the actual save API call later
			await new Promise((resolve) => setTimeout(resolve, 1000)); // Mock API call
			toast.success("Code execution saved successfully");
		} catch (error) {
			toast.error("Failed to save code execution");
			console.error("Save error:", error);
		} finally {
			setIsSaving(false);
		}
	};

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

	const isMobileDevice = isMobile();

	const renderMobileDialog = () => (
		<DialogContent className="flex h-[100dvh] max-h-[100dvh] w-full flex-col overflow-hidden p-0">
			<DialogHeader className="border-b px-4 py-3">
				<div className="flex items-center justify-between">
					<DialogTitle className="text-base font-medium">
						Code Editor
					</DialogTitle>
					<div className="flex items-center gap-2 mr-8">
						{language && (
							<>
								<Badge
									variant={language}
									showIcon={true}
									className="flex items-center gap-1.5 px-2 py-0.5 text-xs"
								>
									{language.toUpperCase()}
								</Badge>
								{isLoadingLanguage && (
									<div className="flex items-center gap-2 text-sm text-muted-foreground">
										<Loader2 className="h-4 w-4 animate-spin" />
										Loading...
									</div>
								)}
							</>
						)}
					</div>
				</div>
			</DialogHeader>

			<div className="flex flex-1 flex-col overflow-hidden">
				{/* Main Content Area */}
				<div className="relative flex-1 overflow-hidden">
					<CodeEditorWrapper
						value={editableCode}
						language={language || ""}
						onChange={(value) => setEditableCode(value)}
						extensions={extensions}
						isProcessing={isProcessing || isLoadingLanguage}
					/>
				</div>

				{/* Bottom Controls */}
				<div className="border-t bg-background p-4 space-y-4">
					{/* Preview Controls */}
					<div className="flex items-center justify-between gap-2">
						<Toggle
							variant="outline"
							aria-label="Toggle preview"
							pressed={isFileVisible}
							onPressedChange={setIsFileVisible}
							className="flex-1 justify-center gap-2"
						>
							<Eye className={isFileVisible ? "h-4 w-4" : "hidden"} />
							<EyeOff className={!isFileVisible ? "h-4 w-4" : "hidden"} />
							<span className="text-sm">Preview</span>
						</Toggle>

						<Button
							variant="outline"
							onClick={handleReset}
							disabled={isProcessing}
							className="gap-2"
						>
							<RotateCcw size={14} />
							Reset
						</Button>
					</div>

					{/* Preview Panel */}
					<AnimatePresence>
						{isFileVisible && (
							<motion.div
								initial={{ height: 0, opacity: 0 }}
								animate={{ height: "12rem", opacity: 1 }}
								exit={{ height: 0, opacity: 0 }}
								className="overflow-hidden rounded-lg border"
							>
								{renderOriginalFile()}
							</motion.div>
						)}
					</AnimatePresence>

					{/* Run Button */}
					<Button
						onClick={handleExecute}
						disabled={isProcessing || !language}
						className="w-full gap-2"
					>
						{isProcessing ? (
							<Loader2 size={14} className="animate-spin" />
						) : (
							<Terminal size={14} />
						)}
						Run Code
					</Button>
				</div>
			</div>
		</DialogContent>
	);

	const renderDesktopDialog = () => (
		<DialogContent className="max-w-[85vw] p-0">
			<DialogHeader className="border-b px-4 py-3">
				<div className="flex items-center justify-between">
					<DialogTitle className="text-base font-medium">
						Code Editor
					</DialogTitle>
					<div className="flex items-center gap-2 mr-8">
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
				</div>
			</DialogHeader>

			<div className="flex h-[70vh] gap-4 p-4">
				<div className="flex flex-1 flex-col">
					<h3 className="mb-2 text-sm font-medium text-muted-foreground">
						Detected Code
					</h3>
					<div className="flex-1 overflow-hidden rounded-lg border">
						<CodeEditorWrapper
							value={editableCode}
							language={language || ""}
							onChange={(value) => setEditableCode(value)}
							extensions={extensions}
							isProcessing={isProcessing || isLoadingLanguage}
						/>
					</div>
				</div>

				{isFileVisible && (
					<div className="flex w-1/2 flex-col">
						<h3 className="mb-2 text-sm font-medium text-muted-foreground">
							Original File
						</h3>
						<div className="flex-1 overflow-hidden rounded-lg border">
							{renderOriginalFile()}
						</div>
					</div>
				)}
			</div>

			<div className="flex items-center justify-between border-t bg-muted/30 p-4">
				<div className="flex items-center gap-2">
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

					<Button
						variant="outline"
						onClick={handleReset}
						disabled={isProcessing}
						className="gap-2"
					>
						<RotateCcw size={14} />
						Reset Changes
					</Button>
				</div>

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
	);

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
							<div className="relative">
								{isProcessing ? (
									<motion.div
										className="absolute -inset-1 bg-blue-500/20 rounded-full blur-sm"
										animate={{ scale: [1, 1.2, 1] }}
										transition={{
											duration: 2,
											repeat: Number.POSITIVE_INFINITY,
										}}
									/>
								) : null}
								<Terminal
									size={16}
									className={`relative z-10 ${isProcessing ? "text-blue-400" : ""}`}
								/>
							</div>
							<span className="font-caskaydiaCoveNerd text-sm font-medium relative">
								Console Output
							</span>
						</div>
					</div>

					<div className="flex items-center gap-2">
						{/* Edit button */}
						<Button
							size="icon"
							variant="ghost"
							className={`h-8 w-8 rounded-full transition-all duration-300 ${
								isProcessing
									? "bg-blue-500/20 text-blue-400 shadow-lg shadow-blue-500/20"
									: "bg-zinc-700/50 hover:bg-zinc-700 hover:shadow-lg"
							}`}
							onClick={() => setIsDialogOpen(true)}
							disabled={isProcessing}
						>
							<Pencil className="h-4 w-4" />
						</Button>

						{/* Save button */}
						<Button
							size="icon"
							variant="ghost"
							className={`h-8 w-8 rounded-full transition-all duration-300 ${
								isProcessing || isSaving
									? "bg-blue-500/20 text-blue-400 shadow-lg shadow-blue-500/20"
									: "bg-zinc-700/50 hover:bg-zinc-700 hover:shadow-lg"
							}`}
							onClick={handleSave}
							disabled={isProcessing || isSaving || !message}
						>
							{isSaving ? (
								<Loader2 className="h-4 w-4 animate-spin" />
							) : (
								<Save className="h-4 w-4" />
							)}
						</Button>
					</div>
				</motion.div>

				<div
					ref={consoleRef}
					className="flex-1 min-h-0 overflow-y-auto bg-zinc-950 p-4 scrollbar-thin scrollbar-track-transparent scrollbar-thumb-zinc-700"
				>
					<AnimatePresence mode="wait">
						{isProcessing ? (
							<motion.div
								className="flex items-center justify-center h-full"
								initial={{ opacity: 0 }}
								animate={{ opacity: 1 }}
								exit={{ opacity: 0 }}
							>
								<div className="relative">
									{/* Code execution visualization */}
									<motion.div
										className="absolute inset-0 flex items-center justify-center"
										initial="hidden"
										animate="visible"
									>
										{[...Array(3)].map((_, i) => (
											<motion.div
												key={`unique-key-${i}-${Date.now()}`}
												className="absolute w-16 h-16 border-2 border-blue-400/30 rounded-lg"
												animate={{
													scale: [1, 1.2, 1],
													opacity: [0.3, 0.5, 0.3],
													rotate: [0, 90, 180, 270, 360],
												}}
											/>
										))}
									</motion.div>

									{/* Terminal icon */}
									<motion.div
										className="relative z-10 bg-zinc-900 p-3 rounded-lg"
										animate={{
											scale: [1, 1.05, 1],
											boxShadow: [
												"0 0 0 0 rgba(59, 130, 246, 0)",
												"0 0 0 8px rgba(59, 130, 246, 0.1)",
												"0 0 0 0 rgba(59, 130, 246, 0)",
											],
										}}
										transition={{
											duration: 2,
											repeat: Number.POSITIVE_INFINITY,
											ease: "easeInOut",
										}}
									>
										<Terminal size={24} className="text-blue-400" />
									</motion.div>

									{/* Progress indicator */}
									<div className="absolute -bottom-6 left-1/2 transform -translate-x-1/2">
										<div className="flex gap-1">
											{[0, 1, 2].map((i) => (
												<motion.div
													key={i}
													className="w-1 h-1 rounded-full bg-blue-400"
													animate={{
														scale: [1, 1.5, 1],
														opacity: [0.3, 1, 0.3],
													}}
													transition={{
														duration: 1,
														repeat: Number.POSITIVE_INFINITY,
														delay: i * 0.2,
													}}
												/>
											))}
										</div>
									</div>
								</div>
							</motion.div>
						) : (
							output.map((item, index) => (
								<motion.div
									key={`${index}-${item.text}`}
									initial={{ opacity: 0, x: -10 }}
									animate={{ opacity: 1, x: 0 }}
									exit={{ opacity: 0, x: 10 }}
									transition={{ duration: 0.2, delay: index * 0.05 }}
								>
									{item.isError ? (
										// Error message block
										<pre className="font-caskaydiaCoveNerd text-red-400 whitespace-pre-wrap break-words">
											{item.text}
										</pre>
									) : (
										// Normal output line
										<div className="flex items-start mb-1">
											<span className="mr-2 font-bold text-emerald-400">
												&gt;
											</span>
											<span className="font-caskaydiaCoveNerd text-zinc-200">
												{item.text}
											</span>
										</div>
									)}
								</motion.div>
							))
						)}
					</AnimatePresence>
				</div>
			</motion.div>

			<Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
				{isMobileDevice ? renderMobileDialog() : renderDesktopDialog()}
			</Dialog>
		</div>
	);
};

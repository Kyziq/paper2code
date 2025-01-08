import { cpp } from "@codemirror/lang-cpp";
import { java } from "@codemirror/lang-java";
import { python } from "@codemirror/lang-python";
import CodeMirror, { EditorView } from "@uiw/react-codemirror";
import { Pencil, Terminal } from "lucide-react";
import { AnimatePresence, motion } from "motion/react";
import { useEffect, useRef, useState } from "react";
import { toast } from "sonner";
import { Badge } from "~/components/ui/badge";
import { Button } from "~/components/ui/button";
import {
	Dialog,
	DialogContent,
	DialogFooter,
	DialogHeader,
	DialogTitle,
} from "~/components/ui/dialog";
import type { SupportedLanguage } from "~shared/constants";

interface ConsoleProps {
	message: string;
	ocrResult?: string;
	language?: SupportedLanguage | null;
	isProcessing?: boolean;
	onExecute?: (code: string) => void;
	showEditButton?: boolean;
}

export const Console = ({
	message,
	ocrResult,
	language,
	isProcessing = false,
	onExecute,
	showEditButton = false,
}: ConsoleProps) => {
	const consoleRef = useRef<HTMLDivElement>(null);
	const [lines, setLines] = useState<string[]>([]);
	const [isTyping, setIsTyping] = useState(false);
	const [isDialogOpen, setIsDialogOpen] = useState(false);
	const [editableCode, setEditableCode] = useState(ocrResult || "");

	useEffect(() => {
		const newLines = message.trim()
			? message.split("\n")
			: ["Your output will appear here."];
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
		toast.info("Code reset to original OCR result");
	};

	const extensions = [
		// Choose language extension based on the selected language
		...(() => {
			switch (language) {
				case "cpp":
					return [cpp()];
				case "python":
					return [python()];
				default:
					return [java()];
			}
		})(),
		// Enable line wrapping
		EditorView.lineWrapping,
	];

	return (
		<div className="relative w-full h-full group">
			<motion.div
				initial={{ opacity: 0, y: 20 }}
				animate={{ opacity: 1, y: 0 }}
				transition={{ duration: 0.3 }}
				className="w-full h-full flex flex-col overflow-hidden rounded-lg bg-zinc-900 font-mono text-zinc-100 shadow-xl"
			>
				<motion.div
					className="flex items-center justify-between bg-zinc-800 p-3"
					initial={{ opacity: 0 }}
					animate={{ opacity: 1 }}
					transition={{ delay: 0.2 }}
				>
					<div className="flex items-center space-x-2">
						<Terminal size={18} />
						<span className="font-caskaydiaCoveNerd text-sm font-semibold">
							Console Output
						</span>
					</div>

					<div className="flex items-center space-x-2">
						{showEditButton && (
							<motion.div
								initial={{ opacity: 0, scale: 0.9 }}
								animate={{ opacity: 1, scale: 1 }}
								transition={{ delay: 0.5 }}
							>
								<Button
									size="icon"
									variant="ghost"
									className="h-8 w-8 rounded-full bg-zinc-700/50 text-zinc-100 hover:bg-zinc-700 hover:text-zinc-50 transition-colors"
									onClick={() => setIsDialogOpen(true)}
									disabled={isProcessing}
									title="Edit Code"
								>
									<Pencil className="h-4 w-4" />
								</Button>
							</motion.div>
						)}
					</div>
				</motion.div>

				<div
					ref={consoleRef}
					className="flex-1 min-h-0 overflow-y-auto bg-zinc-950 p-4"
				>
					<AnimatePresence mode="wait">
						{lines.map((line, index) => (
							<motion.div
								key={`${index}-${line}`}
								initial={{ opacity: 0, x: -10 }}
								animate={{ opacity: 1, x: 0 }}
								exit={{ opacity: 0, x: 10 }}
								transition={{
									duration: 0.2,
									delay: index * 0.05,
									ease: [0.32, 0.72, 0, 1],
								}}
								className="mb-1 flex"
							>
								<motion.span
									className="text-green-400 mr-2"
									initial={{ opacity: 0 }}
									animate={{ opacity: 1 }}
									transition={{ delay: index * 0.05 + 0.1 }}
								>
									&gt;
								</motion.span>
								<motion.span
									className={`font-caskaydiaCoveNerd ${
										message.trim() ? "text-zinc-300" : "italic text-zinc-500"
									}`}
								>
									{line || " "}
								</motion.span>
								{isTyping && index === lines.length - 1 && (
									<motion.span
										initial={{ opacity: 0 }}
										animate={{ opacity: [0, 1, 0] }}
										transition={{
											repeat: Number.POSITIVE_INFINITY,
											duration: 1,
											ease: "linear",
										}}
										className="ml-1 text-zinc-300"
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
				<DialogContent className="max-w-3xl sm:max-h-[85vh] p-0">
					<DialogHeader className="px-6 pt-6 pb-4 border-b">
						<div className="flex items-center gap-3 mb-1">
							<DialogTitle className="text-lg font-semibold">
								Code Editor
							</DialogTitle>
							{ language && (
									<Badge
										variant={language}
										showIcon={true}
										className="px-2 py-0.5 text-xs font-medium"
									>
										{language?.toUpperCase()}
										</Badge>
								)}
							{/* <Badge
								variant="secondary"
								className="px-2 py-0.5 text-xs font-medium"
							>
								{language?.toUpperCase() ?? "No Language"}
							</Badge> */}
						</div>
						<p className="text-sm text-muted-foreground">
							Review and edit the detected code before execution
						</p>
					</DialogHeader>

					<div className="flex-1 px-6 py-4">
						<CodeMirror
							value={editableCode}
							height="400px"
							theme="dark"
							extensions={extensions}
							onChange={(value) => setEditableCode(value)}
							className="font-caskaydiaCoveNerd text-sm"
							editable={!isProcessing}
							basicSetup={{
								lineNumbers: true,
								highlightActiveLineGutter: true,
								highlightSpecialChars: true,
								history: true,
								foldGutter: true,
								drawSelection: true,
								dropCursor: true,
								allowMultipleSelections: true,
								indentOnInput: true,
								syntaxHighlighting: true,
								bracketMatching: true,
								closeBrackets: true,
								autocompletion: true,
								rectangularSelection: true,
								crosshairCursor: true,
								highlightActiveLine: true,
								highlightSelectionMatches: true,
								closeBracketsKeymap: true,
								defaultKeymap: true,
								searchKeymap: true,
								historyKeymap: true,
								foldKeymap: true,
								completionKeymap: true,
								lintKeymap: true,
							}}
						/>
					</div>

					<DialogFooter className="flex flex-col-reverse sm:flex-row gap-3 sm:items-center sm:justify-between p-4 bg-gray-50 dark:bg-gray-900 border-t rounded-b-lg">
            <Button
              variant="outline"
              onClick={handleReset}
              disabled={isProcessing}
              className="w-full sm:w-auto"
            >
              Reset Changes
            </Button>
            <Button
              onClick={handleExecute}
              disabled={isProcessing || !language}
              className="w-full sm:w-auto min-w-[100px]"
            >
              Run Code
            </Button>
          </DialogFooter>
				</DialogContent>
			</Dialog>
		</div>
	);
};

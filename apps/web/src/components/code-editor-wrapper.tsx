import CodeMirror, { type Extension } from "@uiw/react-codemirror";
import { Sparkles } from "lucide-react";
import { useState } from "react";
import { Button } from "./ui/button";
import {
	Tooltip,
	TooltipContent,
	TooltipProvider,
	TooltipTrigger,
} from "./ui/tooltip";

interface CodeEditorWrapperProps {
	value: string;
	language: string;
	onChange: (value: string) => void;
	extensions: Extension[];
	isProcessing?: boolean;
}

export function CodeEditorWrapper({
	value,
	onChange,
	extensions,
	isProcessing = false,
}: CodeEditorWrapperProps) {
	const [isAIProcessing, setIsAIProcessing] = useState(false);

	const handleAIAssist = async () => {
		setIsAIProcessing(true);
		try {
			// TODO: Implement actual AI service call
			await new Promise((resolve) => setTimeout(resolve, 1500));

			// Example response - replace with actual AI service integration
			const aiSuggestions = `// AI improved code\n${value}`;
			onChange(aiSuggestions);
		} catch (error) {
			console.error("AI assistance error:", error);
		} finally {
			setIsAIProcessing(false);
		}
	};

	return (
		<div className="relative">
			{/* Code Editor */}
			<CodeMirror
				value={value}
				height="100%"
				theme="dark"
				extensions={extensions}
				onChange={onChange}
				className="h-full overflow-hidden font-caskaydiaCoveNerd text-sm"
				editable={!isProcessing && !isAIProcessing}
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

			{/* AI Assistant Button - Top Right Corner */}
			<div className="absolute top-2 right-2">
				<TooltipProvider>
					<Tooltip>
						<TooltipTrigger asChild>
							<Button
								size="sm"
								variant="secondary"
								className="gap-1.5 bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700 text-white shadow-lg hover:shadow-xl transition-all duration-300 border border-purple-400/30"
								onClick={handleAIAssist}
								disabled={isProcessing || isAIProcessing}
							>
								<Sparkles
									className={`h-4 w-4 ${!isAIProcessing && "animate-pulse"}`}
								/>
								{isAIProcessing ? (
									<>
										<div className="h-3 w-3 animate-spin rounded-full border-2 border-white border-t-transparent" />
										<span>Processing...</span>
									</>
								) : (
									"AI Assist"
								)}
							</Button>
						</TooltipTrigger>
						<TooltipContent>
							<p>Let AI help optimize and improve your code</p>
						</TooltipContent>
					</Tooltip>
				</TooltipProvider>
			</div>
		</div>
	);
}

import type { Extension } from "@codemirror/state";
import { useMutation } from "@tanstack/react-query";
import CodeMirror from "@uiw/react-codemirror";
import { Sparkles } from "lucide-react";
import { toast } from "sonner";
import { enhanceCode } from "~/api";
import { Button } from "./ui/button";
import {
	Tooltip,
	TooltipContent,
	TooltipProvider,
	TooltipTrigger,
} from "./ui/tooltip";

interface CodeEditorWrapperProps {
	value: string; // Current code value
	language: string; // Programming language
	onChange: (value: string) => void; // Value change handler
	extensions: Extension[]; // CodeMirror extensions
	isProcessing?: boolean; // External processing state
}

export const CodeEditorWrapper = ({
	value,
	onChange,
	extensions,
	language,
	isProcessing = false,
}: CodeEditorWrapperProps) => {
	const enhanceMutation = useMutation({
		mutationFn: () => enhanceCode({ code: value, language }),
		onSuccess: (response) => {
			if (!response.data) {
				toast.error("Error. No enhanced code received");
				return;
			}

			const { enhancedCode } = response.data;
			onChange(enhancedCode);
			toast.success("Code enhanced successfully.");
		},
		onError: (error) => {
			console.error("AI assistance error:", error);
			toast.error("Failed to enhance code. Please try again.");
		},
	});

	const handleAIAssist = () => {
		enhanceMutation.mutate();
	};

	return (
		<div className="relative h-full w-full">
			<CodeMirror
				value={value}
				height="100vh"
				width="100%"
				theme="dark"
				extensions={extensions}
				onChange={onChange}
				className="h-full overflow-hidden font-caskaydiaCoveNerd text-sm"
				editable={!isProcessing && !enhanceMutation.isPending}
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

			<div className="absolute top-2 right-2">
				<TooltipProvider>
					<Tooltip>
						<TooltipTrigger asChild>
							<Button
								size="sm"
								variant="secondary"
								className="gap-1.5 bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700 text-white shadow-lg hover:shadow-xl transition-all duration-300 border border-purple-400/30"
								onClick={handleAIAssist}
								disabled={isProcessing || enhanceMutation.isPending}
							>
								<Sparkles
									className={`h-4 w-4 text-purple-100 ${!enhanceMutation.isPending && "animate-[pulse_1.5s_ease-in-out_infinite]"}`}
								/>
								{enhanceMutation.isPending ? (
									<>
										<div className="h-3 w-3 animate-spin rounded-full border-2 border-white border-t-transparent" />
										<span>Processing...</span>
									</>
								) : (
									"AI Enhance"
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
};

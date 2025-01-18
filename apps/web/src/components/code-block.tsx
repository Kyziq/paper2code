import type { Extension } from "@codemirror/state";
import CodeMirror, { EditorView } from "@uiw/react-codemirror";
import { useEffect, useState } from "react";
import { useThemeStore } from "~/stores/useThemeStore";

interface CodeBlockProps {
	code: string;
	language: "python" | "cpp" | "java";
	maxHeight?: string;
}

export function CodeBlock({ code, language, maxHeight }: CodeBlockProps) {
	const { theme } = useThemeStore();
	const [extensions, setExtensions] = useState<Extension[]>([]);

	// Load language support
	useEffect(() => {
		const loadLanguageSupport = async () => {
			try {
				// biome-ignore lint/suspicious/noImplicitAnyLet: <explanation>
				let extension;
				switch (language) {
					case "python":
						extension = (await import("@codemirror/lang-python")).python();
						break;
					case "cpp":
						extension = (await import("@codemirror/lang-cpp")).cpp();
						break;
					case "java":
						extension = (await import("@codemirror/lang-java")).java();
						break;
					default:
						return;
				}
				setExtensions([
					extension,
					EditorView.theme({
						"&": {
							backgroundColor: "transparent !important",
						},
						".cm-content": {
							fontFamily: '"CaskaydiaCove Nerd Font", monospace !important',
							fontSize: "14px !important",
						},
						".cm-gutters": {
							backgroundColor: "transparent !important",
							border: "none !important",
						},
						".cm-line": {
							padding: "0 4px 0 8px",
						},
					}),
				]);
			} catch (error) {
				console.error("Failed to load language support:", error);
			}
		};

		loadLanguageSupport();
	}, [language]);

	return (
		<div className="relative">
			<div className="rounded-md overflow-hidden" style={{ maxHeight }}>
				<CodeMirror
					value={code}
					theme={theme}
					extensions={extensions}
					editable={false}
					basicSetup={{
						lineNumbers: false,
						highlightActiveLineGutter: false,
						highlightSpecialChars: false,
						history: false,
						foldGutter: false,
						drawSelection: false,
						dropCursor: false,
						allowMultipleSelections: false,
						indentOnInput: false,
						syntaxHighlighting: true,
						bracketMatching: true,
						closeBrackets: false,
						autocompletion: false,
						rectangularSelection: false,
						crosshairCursor: false,
						highlightActiveLine: false,
						highlightSelectionMatches: false,
						closeBracketsKeymap: false,
						defaultKeymap: false,
						searchKeymap: false,
						historyKeymap: false,
						foldKeymap: false,
						completionKeymap: false,
						lintKeymap: false,
					}}
					className="font-caskaydiaCoveNerd text-sm"
				/>
			</div>
		</div>
	);
}

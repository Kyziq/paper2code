import { useMutation } from "@tanstack/react-query";
import { createLazyFileRoute } from "@tanstack/react-router";
import { motion } from "motion/react";
import { useState } from "react";
import { toast } from "sonner";
import { executeCode } from "~/api";
import { Console } from "~/components/console";
import {
	ResizableHandle,
	ResizablePanel,
	ResizablePanelGroup,
} from "~/components/ui/resizable";
import { UploadSection } from "~/components/upload-section";
import { isMobile } from "~/lib/utils";
import type { SupportedLanguage } from "~shared/constants";
import type { FileExecutionParams } from "~shared/types";

// Type definitions
interface DetectedCodeResult {
	code: string;
	fileUrl: string;
	language: SupportedLanguage | null;
}

export const Route = createLazyFileRoute("/")({
	component: Index,
});

function Index() {
	// State
	const [showConsole, setShowConsole] = useState(false);
	const [detectedCode, setDetectedCode] = useState<DetectedCodeResult | null>(
		null,
	);
	const [consoleMessage, setConsoleMessage] = useState("");

	// Code execution mutation
	const executeMutation = useMutation({
		mutationFn: (params: FileExecutionParams) => {
			const toastId = toast.loading("Executing code...");
			return executeCode(params.code, params.language).finally(() =>
				toast.dismiss(toastId),
			);
		},
		onSuccess: (response) => {
			setConsoleMessage(response.data?.output ?? "");
			if (response.data?.output?.toLowerCase().includes("error")) {
				toast.error("Code execution completed with errors", {
					description: "Please check the console output",
				});
			} else {
				toast.success("Code executed successfully!");
			}
		},
		onError: (error: Error) => {
			setConsoleMessage(error.message);
			toast.error("Code execution failed", {
				description: "Please check the console for error details",
			});
		},
	});

	// Handle proceeding to execution
	const handleProceed = (result: DetectedCodeResult) => {
		setDetectedCode(result);
		setShowConsole(true);

		// Auto-execute the code
		if (result.language) {
			executeMutation.mutate({
				code: result.code,
				language: result.language,
			});
		}
	};

	return (
		<div className="flex-grow flex flex-col lg:items-center justify-center p-4 sm:p-6 lg:p-8">
			<motion.div
				className="w-full max-w-6xl overflow-hidden rounded-2xl"
				layout
			>
				<div className="flex flex-col lg:flex-row relative">
					{isMobile() ? (
						// Mobile layout - stacked
						<>
							<motion.div className="flex-1 p-4 sm:p-6 lg:p-8" layout>
								<UploadSection onProceed={handleProceed} />
							</motion.div>

							{showConsole && (
								<motion.div
									initial={{ height: 0 }}
									animate={{ height: 300, opacity: 1 }}
									transition={{ duration: 0.5, ease: [0.32, 0.72, 0, 1] }}
									className="w-full"
								>
									<motion.div
										initial={{ opacity: 0 }}
										animate={{ opacity: 1 }}
										transition={{ delay: 0.3, duration: 0.3 }}
										className="p-4 sm:p-6 flex flex-col h-[300px]"
									>
										<Console
											message={
												executeMutation.isPending
													? "Executing code..."
													: consoleMessage
											}
											ocrResult={detectedCode?.code}
											fileUrl={detectedCode?.fileUrl}
											language={detectedCode?.language}
											isProcessing={executeMutation.isPending}
											onExecute={(code) => {
												if (!detectedCode?.language) {
													toast.error("No programming language detected");
													return;
												}
												executeMutation.mutate({
													code,
													language: detectedCode.language,
												});
											}}
										/>
									</motion.div>
								</motion.div>
							)}
						</>
					) : (
						// Desktop layout - side by side
						<ResizablePanelGroup
							direction="horizontal"
							className="min-h-[400px] w-full rounded-lg"
						>
							<ResizablePanel defaultSize={50} minSize={30}>
								<div className="flex h-full items-center justify-center p-6">
									<UploadSection onProceed={handleProceed} />
								</div>
							</ResizablePanel>

							{showConsole && (
								<>
									<ResizableHandle withHandle />
									<ResizablePanel defaultSize={50} minSize={30}>
										<div className="flex h-full items-center justify-center p-6">
											<Console
												message={
													executeMutation.isPending
														? "Executing code..."
														: consoleMessage
												}
												ocrResult={detectedCode?.code}
												fileUrl={detectedCode?.fileUrl}
												language={detectedCode?.language}
												isProcessing={executeMutation.isPending}
												onExecute={(code) => {
													if (!detectedCode?.language) {
														toast.error("No programming language detected");
														return;
													}
													executeMutation.mutate({
														code,
														language: detectedCode.language,
													});
												}}
											/>
										</div>
									</ResizablePanel>
								</>
							)}
						</ResizablePanelGroup>
					)}
				</div>
			</motion.div>
		</div>
	);
}

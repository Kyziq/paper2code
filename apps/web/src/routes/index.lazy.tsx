import { useMutation, useQueryClient } from "@tanstack/react-query";
import { createLazyFileRoute } from "@tanstack/react-router";
import { motion } from "motion/react";
import { useState } from "react";
import { useDropzone } from "react-dropzone";
import { toast } from "sonner";

import { executeCode, uploadFile } from "~/api";
import { Console } from "~/components/console";
import {
	ResizableHandle,
	ResizablePanel,
	ResizablePanelGroup,
} from "~/components/ui/resizable";
import { UploadSection } from "~/components/upload-section";
import { isMobile } from "~/lib/utils";
import { useStore } from "~/stores/useStore";
import {
	ACCEPTED_FILE_EXTENSIONS,
	MAX_FILE_SIZES,
	type SupportedLanguage,
	type SupportedMimeType,
} from "~shared/constants";
import type { FileExecutionParams, FileUploadParams } from "~shared/types";

export const Route = createLazyFileRoute("/")({
	component: Index,
});

function Index() {
	const {
		file,
		language,
		consoleMessage,
		ocrResult,
		fileUrl,
		setFile,
		setLanguage,
		setConsoleMessage,
		setOcrResult,
		setFileUrl,
	} = useStore();

	const queryClient = useQueryClient();
	const [showConsole, setShowConsole] = useState(false);

	const uploadMutation = useMutation({
		mutationFn: (data: FileUploadParams) => {
			const toastId = toast.loading("Extracting code from image...");
			return uploadFile(data).finally(() => toast.dismiss(toastId));
		},
		onSuccess: (result) => {
			if (result.data) {
				setConsoleMessage(result.message);
				setOcrResult(result.data.code);
				setFileUrl(result.data.fileUrl);

				setShowConsole(true);

				executeMutation.mutate({
					code: result.data.code,
					language: result.data.language as SupportedLanguage,
				});
			}
			queryClient.invalidateQueries({ queryKey: ["fileStatus"] });
		},
		onError: (error: Error) => {
			setConsoleMessage(error.message);
			setShowConsole(true);
			toast.error("Failed to process file");
		},
	});

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
			queryClient.invalidateQueries({ queryKey: ["executionResult"] });
		},
		onError: (error: Error) => {
			setConsoleMessage(error.message);
			toast.error("Code execution failed", {
				description: "Please check the console for error details",
			});
		},
	});

	const { getRootProps, getInputProps, isDragActive } = useDropzone({
		onDrop: (acceptedFiles) => {
			const file = acceptedFiles[0];
			if (!file) return;

			// Check file size
			const maxSize = MAX_FILE_SIZES[file.type as SupportedMimeType];
			if (file.size > maxSize) {
				const maxSizeMB = maxSize / (1024 * 1024);
				toast.error(`File size exceeds ${maxSizeMB}MB limit`);
				return;
			}

			setFile(file);
		},
		onDropRejected: (fileRejections) => {
			const firstRejection = fileRejections[0];
			const error = firstRejection?.errors[0];

			if (error?.code === "file-invalid-type") {
				toast.error("Invalid file type", {
					description: `Please upload: ${Object.values(ACCEPTED_FILE_EXTENSIONS)
						.flat()
						.join(", ")}`,
				});
			} else {
				toast.error("File upload rejected", {
					description: error?.message || "Unknown error occurred",
				});
			}
		},
		accept: ACCEPTED_FILE_EXTENSIONS,
		multiple: false,
		// Validate file size
		validator: (file) => {
			const maxSize = MAX_FILE_SIZES[file.type as SupportedMimeType];
			if (file.size > maxSize) {
				return {
					code: "file-too-large",
					message: `File size exceeds ${maxSize / (1024 * 1024)}MB limit`,
				};
			}
			return null;
		},
	});

	const isUploadPending = uploadMutation.isPending;
	const isExecutePending = executeMutation.isPending;
	const isProcessing = isUploadPending || isExecutePending;
	const getConsoleMessage = () => {
		if (isUploadPending) return "Processing file...";
		if (isExecutePending) return "Executing code...";
		return consoleMessage;
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
								<UploadSection
									language={language}
									setLanguage={setLanguage}
									file={file}
									getRootProps={getRootProps}
									getInputProps={getInputProps}
									isProcessing={isProcessing}
									isDragActive={isDragActive}
									onUpload={() => {
										if (!language)
											return toast.error("Please select a language.");
										if (!file) return toast.error("Please upload a file.");
										uploadMutation.mutate({ file, language });
									}}
									onClearFile={() => setFile(null)}
								/>
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
											message={getConsoleMessage()}
											ocrResult={ocrResult}
											fileUrl={fileUrl}
											language={language}
											isProcessing={isProcessing}
											onExecute={(code) => {
												if (!language) {
													toast.error("Please select a language");
													return;
												}
												executeMutation.mutate({ code, language });
											}}
										/>
									</motion.div>
								</motion.div>
							)}
						</>
					) : (
						// Desktop layout
						<ResizablePanelGroup
							direction="horizontal"
							className="min-h-[400px] w-full rounded-lg"
						>
							<ResizablePanel defaultSize={50} minSize={30}>
								<div className="flex h-full items-center justify-center p-6">
									<UploadSection
										language={language}
										setLanguage={setLanguage}
										file={file}
										getRootProps={getRootProps}
										getInputProps={getInputProps}
										isProcessing={isProcessing}
										isDragActive={isDragActive}
										onUpload={() => {
											if (!language)
												return toast.error("Please select a language.");
											if (!file) return toast.error("Please upload a file.");
											uploadMutation.mutate({ file, language });
										}}
										onClearFile={() => setFile(null)}
									/>
								</div>
							</ResizablePanel>

							{showConsole && (
								<>
									<ResizableHandle withHandle />
									<ResizablePanel defaultSize={50} minSize={30}>
										<div className="flex h-full items-center justify-center p-6">
											<Console
												message={getConsoleMessage()}
												ocrResult={ocrResult}
												fileUrl={fileUrl}
												language={language}
												isProcessing={isProcessing}
												onExecute={(code) => {
													if (!language) {
														toast.error("Please select a language");
														return;
													}
													executeMutation.mutate({ code, language });
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

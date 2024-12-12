import { useMutation, useQueryClient } from "@tanstack/react-query";
import { createLazyFileRoute } from "@tanstack/react-router";
import { FileText, Upload } from "lucide-react";
import { motion } from "motion/react";
import { useState } from "react";
import { useDropzone } from "react-dropzone";
import { toast } from "sonner";

import { executeFile, uploadFile } from "~/api";
import { Console } from "~/components/console";
import { Button } from "~/components/ui/button";
import { Label } from "~/components/ui/label";
import { LoadingSpinner } from "~/components/ui/loading-spinner";
import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from "~/components/ui/select";
import { cn } from "~/lib/utils";
import { useStore } from "~/stores/useStore";
import {
	ACCEPTED_FILE_EXTENSIONS,
	SUPPORTED_LANGUAGES,
} from "~shared/constants";
import type {
	FileExecutionParams,
	FileExecutionResponse,
	FileUploadParams,
	FileUploadResponse,
} from "~shared/types";

export const Route = createLazyFileRoute("/")({
	component: Index,
});

function Index() {
	const {
		file,
		language,
		consoleMessage,
		setFile,
		setLanguage,
		setConsoleMessage,
	} = useStore();
	const queryClient = useQueryClient();
	const [showConsole, setShowConsole] = useState(false);

	const uploadMutation = useMutation({
		mutationFn: (data: FileUploadParams) => uploadFile(data),
		onSuccess: (result: FileUploadResponse) => {
			setConsoleMessage(result.message ?? "");
			toast.success("File uploaded successfully. Proceeding to execution...");
			setShowConsole(true);

			if (result.data) {
				executeMutation.mutate({
					code: result.data.code,
					language: result.data.language,
				});
			}
			queryClient.invalidateQueries({ queryKey: ["fileStatus"] });
		},
		onError: (error: Error) => {
			setConsoleMessage(error.message);
			setShowConsole(true);
			toast.error("Error uploading file. Check the console for details.");
		},
	});

	const executeMutation = useMutation({
		mutationFn: (params: FileExecutionParams) =>
			executeFile(params.code, params.language),
		onSuccess: (response: FileExecutionResponse) => {
			setConsoleMessage(response.data?.output ?? "");
			toast.success("Code executed successfully");
			queryClient.invalidateQueries({ queryKey: ["executionResult"] });
		},
		onError: (error: Error) => {
			setConsoleMessage(error.message);
			toast.error("Error executing code. Check the console for details.");
		},
	});

	const { getRootProps, getInputProps } = useDropzone({
		onDrop: (acceptedFiles) => {
			setFile(acceptedFiles[0]);
		},
		onDropRejected: () =>
			toast.error(
				`Invalid file type. Please upload: ${Object.values(
					ACCEPTED_FILE_EXTENSIONS,
				)
					.flat()
					.join(", ")}`,
			),
		accept: ACCEPTED_FILE_EXTENSIONS,
		multiple: false,
	});

	const isUploadPending = uploadMutation.isPending;
	const isExecutePending = executeMutation.isPending;
	const isProcessing = isUploadPending || isExecutePending;
	const getConsoleMessage = () => {
		if (isUploadPending) return "Uploading file...";
		if (isExecutePending) return "Executing file...";
		return consoleMessage;
	};

	return (
		<div className="flex-grow flex items-center justify-center p-4 sm:p-6 lg:p-8">
			<motion.div
				className="w-full max-w-6xl overflow-hidden rounded-2xl"
				layout
			>
				<div className="flex relative">
					<motion.div className="flex-1 p-8" layout>
						<motion.div
							className={`${showConsole ? "max-w-md" : "max-w-xl"} mx-auto transition-all duration-500`}
							layout
						>
							<h1 className="text-4xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 dark:from-blue-400 dark:to-indigo-400 bg-clip-text text-transparent mb-2">
								paper2code
							</h1>
							<p className="mb-6 text-slate-600 dark:text-slate-300">
								Execute your handwritten code with ease.
							</p>

							<div className="space-y-4">
								<div className="space-y-1.5 max-w-[180px]">
									<Label htmlFor="language-select" className="text-sm">
										Programming Language
									</Label>
									<Select
										onValueChange={setLanguage}
										value={language || undefined}
									>
										<SelectTrigger id="language-select">
											<SelectValue placeholder="Choose..." />
										</SelectTrigger>
										<SelectContent>
											{SUPPORTED_LANGUAGES.map(({ value, label }) => (
												<SelectItem key={value} value={value}>
													{label}
												</SelectItem>
											))}
										</SelectContent>
									</Select>
								</div>

								<div>
									<Label className="text-sm">Code File</Label>
									<div
										{...getRootProps()}
										className={cn(
											"mt-1.5 bg-background border rounded-md transition-colors duration-200",
											"hover:border-blue-500",
										)}
									>
										<div className="px-6 py-10 text-center cursor-pointer">
											<input {...getInputProps()} />
											{file ? (
												<div className="text-slate-700 dark:text-slate-200">
													<FileText className="mx-auto h-12 w-12 text-blue-500 dark:text-blue-400 mb-4" />
													<p className="font-medium">{file.name}</p>
													<p className="mt-1 text-sm text-slate-500">
														Click or drag to replace
													</p>
												</div>
											) : (
												<div>
													<FileText className="mx-auto h-12 w-12 text-blue-500 dark:text-blue-400" />
													<div className="mt-4">
														<span className="text-blue-600 dark:text-blue-400 font-medium">
															Upload a file
														</span>
														<span className="text-slate-600 dark:text-slate-400 ml-1">
															or drag and drop
														</span>
													</div>
													<p className="mt-1 text-sm text-slate-500">
														PNG, JPG, JPEG, PDF up to 5MB
													</p>
												</div>
											)}
										</div>
									</div>
								</div>

								<Button
									onClick={() => {
										if (!language)
											return toast.error("Please select a language.");
										if (!file) return toast.error("Please upload a file.");
										uploadMutation.mutate({ file, language });
									}}
									disabled={isProcessing}
									className="w-full h-11 bg-blue-800 hover:bg-blue-900 dark:bg-blue-600
                    dark:hover:bg-blue-700 text-white shadow-lg hover:shadow-xl
                    transition-all duration-200"
								>
									{isProcessing ? (
										<LoadingSpinner className="h-5 w-5 border-white border-t-transparent" />
									) : (
										<>
											<Upload className="mr-2 h-4 w-4" />
											Upload
										</>
									)}
								</Button>
							</div>
						</motion.div>
					</motion.div>

					{showConsole && (
						<motion.div
							initial={{ width: 0, opacity: 0 }}
							animate={{
								width: "50%",
								opacity: 1,
								transition: { duration: 0.5, ease: [0.32, 0.72, 0, 1] },
							}}
							className="relative"
						>
							<motion.div
								initial={{ opacity: 0 }}
								animate={{ opacity: 1 }}
								transition={{ delay: 0.3, duration: 0.3 }}
								className="absolute inset-0 p-6"
							>
								<Console message={getConsoleMessage()} />
							</motion.div>
						</motion.div>
					)}
				</div>
			</motion.div>
		</div>
	);
}

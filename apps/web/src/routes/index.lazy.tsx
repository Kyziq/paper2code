import { useMutation, useQueryClient } from "@tanstack/react-query";
import { createLazyFileRoute } from "@tanstack/react-router";
import { FileText, Upload } from "lucide-react";
import { useDropzone } from "react-dropzone";
import { toast } from "sonner";

import { executeFile, uploadFile } from "~/api";
import { useStore } from "~/stores/useStore";
import { ALLOWED_FILE_TYPES, LANGUAGES } from "~/utils/constants.ts";
import type {
	FileExecutionParams,
	FileExecutionResponse,
	FileUploadParams,
	FileUploadResponse,
} from "~shared/types";

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

	const uploadMutation = useMutation({
		mutationFn: (data: FileUploadParams) => uploadFile(data),
		onSuccess: (result: FileUploadResponse) => {
			setConsoleMessage(result.message ?? "");
			toast.success("File uploaded successfully. Proceeding to execution...");

			// Run execute mutation if file upload is successful
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

	const handleUpload = () => {
		if (!language) return toast.error("Please select a language.");
		if (!file) return toast.error("Please upload a file.");
		uploadMutation.mutate({ file, language });
	};

	const { getRootProps, getInputProps } = useDropzone({
		onDrop: (acceptedFiles) => setFile(acceptedFiles[0]),
		accept: ALLOWED_FILE_TYPES,
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
			<div className="w-full max-w-6xl overflow-hidden rounded-2xl shadow-xl transition-all duration-200">
				<div className="flex flex-col md:flex-row">
					{/* Left Section */}
					<div className="p-8 md:w-1/2 bg-white dark:bg-gray-800 transition-all duration-200">
						<h1 className="text-4xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 dark:from-blue-400 dark:to-indigo-400 bg-clip-text text-transparent mb-2">
							paper2code
						</h1>
						<p className="mb-8 text-slate-600 dark:text-slate-300">
							Execute your handwritten code with ease.
						</p>

						<div className="space-y-6">
							<div>
								<Label
									htmlFor="language-select"
									className="text-sm font-medium text-slate-700 dark:text-slate-200"
								>
									Programming Language
								</Label>
								<Select
									onValueChange={setLanguage}
									value={language || undefined}
								>
									<SelectTrigger
										id="language-select"
										className="w-full mt-1 bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-700"
									>
										<SelectValue placeholder="Choose a language..." />
									</SelectTrigger>
									<SelectContent className="bg-white dark:bg-slate-900">
										{LANGUAGES.map(({ value, label }) => (
											<SelectItem key={value} value={value}>
												{label}
											</SelectItem>
										))}
									</SelectContent>
								</Select>
							</div>

							{/* File Upload Section */}
							<div>
								<Label className="text-sm font-medium text-slate-700 dark:text-slate-200">
									Code File
								</Label>
								<div
									className="mt-1 rounded-xl border-2 border-dashed border-slate-200 dark:border-slate-700
                    hover:border-blue-500 dark:hover:border-blue-400 transition-colors duration-200
                    bg-white/50 dark:bg-slate-900/50"
								>
									<div
										{...getRootProps()}
										className="px-6 py-8 text-center cursor-pointer"
									>
										<input {...getInputProps()} />
										{file ? (
											<p className="text-slate-700 dark:text-slate-200">
												{file.name}
											</p>
										) : (
											<div>
												<FileText className="mx-auto h-12 w-12 text-blue-500 dark:text-blue-400 mb-3" />
												<div className="flex justify-center text-sm">
													<span className="font-medium text-blue-600 dark:text-blue-400 hover:text-blue-500">
														Upload a file
													</span>
													<span className="pl-1 text-slate-600 dark:text-slate-400">
														or drag and drop
													</span>
												</div>
												<p className="text-xs text-slate-500 dark:text-slate-400">
													PNG, JPG, JPEG, PDF up to 5MB
												</p>
											</div>
										)}
									</div>
								</div>
							</div>

							{/* Upload Button */}
							<Button
								className="w-full bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700
                  dark:from-blue-500 dark:to-indigo-500 dark:hover:from-blue-600 dark:hover:to-indigo-600
                  text-white shadow-lg hover:shadow-xl transition-all duration-200"
								onClick={handleUpload}
								disabled={isProcessing}
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
					</div>

					{/* Right Section */}
					<div className="flex flex-col items-center justify-center p-6 md:w-1/2 bg-white dark:bg-gray-800 transition-all duration-200">
						<Console message={getConsoleMessage()} />
					</div>
				</div>
			</div>
		</div>
	);
}

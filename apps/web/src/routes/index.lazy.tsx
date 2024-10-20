import { useMutation, useQueryClient } from "@tanstack/react-query";
import { createLazyFileRoute } from "@tanstack/react-router";
import { FileText, Upload } from "lucide-react";
import { useDropzone } from "react-dropzone";
import { toast } from "sonner";

import { executeFile, uploadFile } from "@/api";
import useStore from "@/stores/useStore";
import { ALLOWED_FILE_TYPES, LANGUAGES } from "@/utils/constants.ts";
import type {
	FileExecutionResponse,
	FileUploadParams,
	FileUploadResponse,
} from "@shared/types";

import { Console } from "@/components/console";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { LoadingSpinner } from "@/components/ui/loading-spinner";
import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from "@/components/ui/select";

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
			handleExecute(result.data?.uploadedFilePath || ""); // Automatically trigger execution after upload
			queryClient.invalidateQueries({ queryKey: ["fileStatus"] });
		},
		onError: (error: Error) => {
			setConsoleMessage(error.message); // For console
			toast.error("Error uploading file. Check the console for details.");
		},
	});

	const executeMutation = useMutation({
		mutationFn: (filePath: string) => executeFile(filePath),
		onSuccess: (response: FileExecutionResponse) => {
			setConsoleMessage(response.data?.output ?? "");
			toast.success("File executed successfully");
			queryClient.invalidateQueries({ queryKey: ["executionResult"] });
		},
		onError: (error: Error) => {
			setConsoleMessage(error.message);
			toast.error("Error executing file. Check the console for details.");
		},
	});

	const handleUpload = () => {
		if (!language) return toast.error("Please select a language.");
		if (!file) return toast.error("Please select a file.");
		uploadMutation.mutate({ file, language });
	};

	const handleExecute = (filePath: string) => {
		executeMutation.mutate(filePath);
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
		<div className="p-4 sm:p-6 lg:p-8 flex-grow flex items-center justify-center">
			<div className="w-full max-w-6xl overflow-hidden rounded-2xl bg-white shadow-xl">
				<div className="flex flex-col md:flex-row">
					{/* Left Section */}
					<div className="bg-white p-8 md:w-1/2">
						<h1 className="mb-2 text-4xl font-extrabold text-gray-900">
							paper2code
						</h1>
						<p className="mb-8 text-indigo-600">
							Execute your handwritten code with ease.
						</p>
						<div className="space-y-6">
							<div>
								<Label
									htmlFor="language-select"
									className="mb-1 text-sm font-medium text-gray-700"
								>
									Programming Language
								</Label>
								<Select
									onValueChange={setLanguage}
									value={language || undefined}
								>
									<SelectTrigger id="language-select" className="w-[200px]">
										<SelectValue placeholder="Choose a language..." />
									</SelectTrigger>
									<SelectContent>
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
								<Label className="mb-1 text-sm font-medium text-gray-700">
									Code File
								</Label>
								<div className="mt-1 flex justify-center rounded-lg border-2 border-dashed border-gray-300 px-6 pb-6 pt-5 transition-colors hover:border-indigo-500">
									<div {...getRootProps()} className="space-y-1 text-center">
										<input {...getInputProps()} />
										{file ? (
											<p className="text-gray-700">{file.name}</p>
										) : (
											<div>
												<FileText className="mx-auto h-12 w-12 text-gray-400" />
												<div className="flex text-sm text-gray-600">
													<span className="relative cursor-pointer rounded-md bg-white font-medium text-indigo-600 focus-within:outline-none focus-within:ring-2 focus-within:ring-indigo-500 focus-within:ring-offset-2 hover:text-indigo-500">
														<span>Upload a file</span>
													</span>
													<span className="pl-1">or drag and drop</span>
												</div>
												<p className="text-xs text-gray-500">
													PNG, JPG, JPEG, PDF up to 5MB
												</p>
											</div>
										)}
									</div>
								</div>
							</div>
							{/* Upload Button */}
							<Button
								className="flex w-full items-center justify-center bg-indigo-600 text-white hover:bg-indigo-700"
								onClick={handleUpload}
								disabled={isProcessing}
							>
								{isProcessing ? (
									<LoadingSpinner className="h-6 w-6 border-white border-t-indigo-600" />
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
					<div className="flex flex-col items-center justify-center bg-white p-6 md:w-1/2">
						<Console message={getConsoleMessage()} />
					</div>
				</div>
			</div>
		</div>
	);
}

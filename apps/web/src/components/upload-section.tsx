import { useMutation } from "@tanstack/react-query";
import { ArrowRight, FileText, Image, Info, Upload } from "lucide-react";
import { AnimatePresence, motion } from "motion/react";
import { useState } from "react";
import { useDropzone } from "react-dropzone";
import { toast } from "sonner";
import { detectLanguage, uploadFile } from "~/api";
import { Badge } from "~/components/ui/badge";
import { Button } from "~/components/ui/button";
import { Label } from "~/components/ui/label";
import {
	Popover,
	PopoverContent,
	PopoverTrigger,
} from "~/components/ui/popover";
import {
	Tooltip,
	TooltipContent,
	TooltipProvider,
	TooltipTrigger,
} from "~/components/ui/tooltip";
import { isMobile } from "~/lib/utils";
import {
	ACCEPTED_FILE_EXTENSIONS,
	MAX_FILE_SIZES,
	SUPPORTED_LANGUAGES,
	type SupportedLanguage,
	type SupportedMimeType,
} from "~shared/constants";
import type { FileUploadParams } from "~shared/types";

// Type definitions
interface DetectedCodeResult {
	code: string;
	fileUrl: string;
	language: SupportedLanguage | null;
}

interface ImprovedUploadSectionProps {
	onProceed: (result: DetectedCodeResult) => void;
}

const formatFileSize = (bytes: number): string => {
	return `${(bytes / (1024 * 1024)).toFixed(2)} MB`;
};

const getFileIcon = (fileType: string) => {
	if (fileType === "application/pdf") {
		return <FileText className="h-8 w-8 text-blue-500 dark:text-blue-400" />;
	}
	if (fileType.startsWith("image/")) {
		return <Image className="h-8 w-8 text-blue-500 dark:text-blue-400" />;
	}
	return <FileText className="h-8 w-8 text-gray-500 dark:text-gray-400" />;
};

const dropzoneVariants = {
	idle: {
		backgroundColor: "rgba(255, 255, 255, 0)",
		transition: { duration: 0.2 },
	},
	active: {
		backgroundColor: "rgba(59, 130, 246, 0.1)",
		scale: 1.02,
		transition: { duration: 0.2 },
	},
};

const uploaderVariants = {
	hidden: {
		opacity: 0,
		y: 20,
	},
	visible: {
		opacity: 1,
		y: 0,
		transition: {
			duration: 0.3,
			when: "beforeChildren",
			staggerChildren: 0.1,
		},
	},
	exit: {
		opacity: 0,
		y: -20,
		transition: { duration: 0.2 },
	},
};

const iconVariants = {
	hidden: {
		scale: 0.5,
		opacity: 0,
	},
	visible: {
		scale: 1,
		opacity: 1,
		transition: {
			type: "spring",
			stiffness: 300,
			damping: 20,
		},
	},
};

const textVariants = {
	hidden: {
		opacity: 0,
		y: 10,
	},
	visible: {
		opacity: 1,
		y: 0,
		transition: { duration: 0.2 },
	},
};

export default function ImprovedUploadSection({
	onProceed,
}: ImprovedUploadSectionProps) {
	const [file, setFile] = useState<File | null>(null);
	const [isProcessing, setIsProcessing] = useState(false);
	const isMobileDevice = isMobile();

	// Upload and Language Detection Mutation
	const uploadMutation = useMutation({
		mutationFn: async ({ file }: FileUploadParams) => {
			const uploadResult = await uploadFile({ file });
			if (!uploadResult.data?.code) {
				throw new Error("No code extracted from file");
			}

			// Detect language after successful upload
			const languageResult = await detectLanguage(uploadResult.data.code);

			return {
				code: uploadResult.data.code,
				fileUrl: uploadResult.data.fileUrl,
				language: languageResult.data?.language ?? null,
			};
		},
		onSuccess: (result) => {
			if (!result.language) {
				setFile(null); // Clear the file
				toast.error("Unsupported programming language", {
					description: "Currently supporting Python, C++, and Java only",
				});
				return;
			}

			// Language supported - show success
			const langInfo = SUPPORTED_LANGUAGES.find(
				(l) => l.value === result.language,
			);
			toast.success(
				`Detected ${langInfo?.label || result.language.toUpperCase()} code`,
				{ description: "Click 'Next' to run the code" },
			);
		},
		onError: (error: Error) => {
			toast.error("Processing failed", { description: error.message });
			setFile(null);
		},
		onSettled: () => {
			setIsProcessing(false);
		},
	});

	// Dropzone configuration
	const { getRootProps, getInputProps, isDragActive } = useDropzone({
		onDrop: async (acceptedFiles) => {
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
			setIsProcessing(true);
			uploadMutation.mutate({ file });
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
		disabled: isProcessing,
	});

	const getDropzoneClassName = (isDragActive: boolean): string =>
		`p-6 block rounded-lg cursor-pointer w-full relative overflow-hidden border-2 border-dashed transition-colors duration-200 ${
			isDragActive
				? "border-blue-500 dark:border-blue-400 bg-blue-50/50 dark:bg-blue-900/20"
				: "border-gray-200 dark:border-neutral-800 hover:border-blue-400 dark:hover:border-blue-500"
		}`;

	const InfoComponent = () => {
		const content = (
			<div className="space-y-2 text-sm">
				<p>
					<strong>Note:</strong>
				</p>
				<ul className="list-disc pl-4 space-y-1">
					<li>User input during execution is not supported yet</li>
					<li>Supported languages: Python, C++, and Java</li>
				</ul>
			</div>
		);

		if (isMobileDevice) {
			return (
				<Popover>
					<PopoverTrigger>
						<Info className="h-4 w-4 text-slate-400 hover:text-slate-600 dark:text-slate-500 dark:hover:text-slate-300" />
					</PopoverTrigger>
					<PopoverContent className="w-[260px]">{content}</PopoverContent>
				</Popover>
			);
		}

		return (
			<TooltipProvider>
				<Tooltip>
					<TooltipTrigger asChild>
						<Info className="h-4 w-4 text-slate-400 hover:text-slate-600 dark:text-slate-500 dark:hover:text-slate-300 cursor-help" />
					</TooltipTrigger>
					<TooltipContent side="right" align="start" className="max-w-[260px]">
						{content}
					</TooltipContent>
				</Tooltip>
			</TooltipProvider>
		);
	};

	const handleNext = () => {
		if (uploadMutation.data) {
			onProceed(uploadMutation.data);
		}
	};

	return (
		<div className="mx-auto w-full max-w-xl">
			{/* Header Section */}
			<motion.div
				initial={{ opacity: 0, y: 30 }}
				animate={{ opacity: 1, y: 0 }}
				transition={{ duration: 0.6, ease: "easeOut" }}
			>
				<motion.h1 className="text-3xl lg:text-4xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 dark:from-blue-400 dark:to-indigo-400 bg-clip-text text-transparent mb-2">
					paper2code
				</motion.h1>
				<motion.p className="mb-6 text-slate-600 dark:text-slate-300">
					Upload handwritten code and instantly convert it into executable
					programs. Supporting Python, C++, and Java.
				</motion.p>
			</motion.div>

			{/* Upload Section */}
			<motion.div
				className="space-y-4"
				initial={{ opacity: 0 }}
				animate={{ opacity: 1 }}
				transition={{ duration: 0.5, delay: 0.3 }}
			>
				<motion.div
					className="space-y-1.5"
					initial={{ opacity: 0, y: 20 }}
					animate={{ opacity: 1, y: 0 }}
					transition={{ delay: 0.6 }}
				>
					<div className="flex items-center gap-2">
						<Label className="text-sm font-medium">Handwritten Code File</Label>
						<InfoComponent />
					</div>

					<div {...getRootProps()}>
						<motion.div
							variants={dropzoneVariants}
							animate={isDragActive ? "active" : "idle"}
							className={getDropzoneClassName(isDragActive)}
						>
							<input {...getInputProps()} />
							<AnimatePresence mode="wait">
								{file ? (
									<motion.div
										key="file-card"
										initial={{ opacity: 0, scale: 0.9 }}
										animate={{
											opacity: 1,
											scale: 1,
											y: 0,
											transition: {
												type: "spring",
												stiffness: 300,
												damping: 25,
											},
										}}
										exit={{
											opacity: 0,
											scale: 0.9,
											transition: { duration: 0.2 },
										}}
										className="relative z-40 bg-white/80 dark:bg-neutral-900/80 backdrop-blur-sm flex flex-col items-start justify-start p-4 w-full mx-auto rounded-lg shadow-lg border border-gray-200/50 dark:border-neutral-800/50"
									>
										{/* File card content */}
										<div className="flex justify-between w-full items-center gap-4">
											<div className="flex items-center gap-3 flex-1 min-w-0">
												<motion.div
													initial={{ scale: 0 }}
													animate={{ scale: 1 }}
													transition={{
														type: "spring",
														stiffness: 400,
														damping: 20,
													}}
												>
													{getFileIcon(file.type)}
												</motion.div>
												<div className="flex-1 min-w-0">
													<motion.p
														initial={{ opacity: 0, x: -20 }}
														animate={{ opacity: 1, x: 0 }}
														className="text-base font-medium text-neutral-700 dark:text-neutral-300 truncate"
													>
														{file.name}
													</motion.p>
													<motion.div
														initial={{ opacity: 0 }}
														animate={{ opacity: 1 }}
														transition={{ delay: 0.1 }}
														className="flex items-center gap-2 mt-1"
													>
														<p className="text-sm text-neutral-500 dark:text-neutral-400">
															{formatFileSize(file.size)}
														</p>
														{uploadMutation.data?.language && (
															<motion.div
																initial={{ opacity: 0, scale: 0.8 }}
																animate={{ opacity: 1, scale: 1 }}
																transition={{
																	type: "spring",
																	stiffness: 400,
																	damping: 20,
																}}
															>
																<Badge
																	variant={uploadMutation.data.language}
																	showIcon={true}
																	className="text-xs"
																>
																	{
																		SUPPORTED_LANGUAGES.find(
																			(l) =>
																				l.value ===
																				uploadMutation.data.language,
																		)?.label
																	}
																</Badge>
															</motion.div>
														)}
													</motion.div>
												</div>
											</div>

											{isProcessing && (
												<motion.div
													initial={{ opacity: 0, scale: 0.8 }}
													animate={{ opacity: 1, scale: 1 }}
													className="flex items-center gap-2"
												>
													<div className="h-4 w-4 animate-spin rounded-full border-2 border-blue-500 border-t-transparent" />
													<span className="text-sm text-blue-500">
														Processing...
													</span>
												</motion.div>
											)}
										</div>
									</motion.div>
								) : (
									<motion.div
										key="upload-prompt"
										variants={uploaderVariants}
										initial="hidden"
										animate="visible"
										exit="exit"
										className="text-center relative z-10"
									>
										<motion.div
											variants={iconVariants}
											className="rounded-full bg-blue-50 dark:bg-blue-900/30 p-4 mx-auto mb-4 w-fit"
											whileHover={{
												scale: 1.05,
												boxShadow: "0 0 20px rgba(59, 130, 246, 0.3)",
											}}
											whileTap={{ scale: 0.95 }}
										>
											<Upload className="h-8 w-8 text-blue-500 dark:text-blue-400" />
										</motion.div>

										<AnimatePresence mode="wait">
											{isDragActive ? (
												<motion.div
													key="drag-active"
													variants={textVariants}
													className="text-lg font-medium text-blue-600 dark:text-blue-400"
												>
													<motion.span
														initial={{ opacity: 0, y: 10 }}
														animate={{ opacity: 1, y: 0 }}
														transition={{ duration: 0.2 }}
													>
														Drop your file here
													</motion.span>
												</motion.div>
											) : (
												<motion.div key="drag-inactive" variants={textVariants}>
													<motion.span className="text-blue-600 dark:text-blue-400 font-medium">
														Upload a file
													</motion.span>
													<motion.span className="text-slate-600 dark:text-slate-400 ml-1">
														or drag and drop
													</motion.span>
													<motion.p
														className="text-sm text-slate-500 mt-1"
														initial={{ opacity: 0 }}
														animate={{ opacity: 1 }}
														transition={{ delay: 0.2 }}
													>
														PNG, JPG, JPEG, PDF up to 5MB
													</motion.p>
												</motion.div>
											)}
										</AnimatePresence>
									</motion.div>
								)}
							</AnimatePresence>
						</motion.div>
					</div>
				</motion.div>

				{/* Next Button */}
				<motion.div
					initial={{ opacity: 0, y: 20 }}
					animate={{ opacity: 1, y: 0 }}
					transition={{ delay: 0.7 }}
				>
					<Button
						onClick={handleNext}
						disabled={isProcessing || !file || !uploadMutation.data?.language}
						className="w-full bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 dark:from-blue-500 dark:to-indigo-500 dark:hover:from-blue-600 dark:hover:to-indigo-600 text-white transition-all duration-200"
						size="lg"
					>
						<motion.div
							className="flex items-center justify-center gap-2"
							whileHover={{ scale: 1.02 }}
							whileTap={{ scale: 0.98 }}
						>
							Next
							<ArrowRight className="h-4 w-4" />
						</motion.div>
					</Button>
				</motion.div>
			</motion.div>
		</div>
	);
}

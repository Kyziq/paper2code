import { FileText, Image, Upload, X } from "lucide-react";
import { AnimatePresence, motion } from "motion/react";
import type { DropzoneInputProps, DropzoneRootProps } from "react-dropzone";
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
import { SUPPORTED_LANGUAGES, type SupportedLanguage } from "~shared/constants";

// Types
interface UploadSectionProps {
	language: SupportedLanguage | null;
	setLanguage: (language: SupportedLanguage) => void;
	file: File | null;
	getRootProps: <T extends DropzoneRootProps>(props?: T) => T;
	getInputProps: <T extends DropzoneInputProps>(props?: T) => T;
	isProcessing: boolean;
	onUpload: () => void;
	isDragActive?: boolean;
	onClearFile?: () => void;
}

interface FileDetailsProps {
	file: File;
	onClear?: () => void;
}
// Animation variants
const animations = {
	fadeInUp: {
		initial: { opacity: 0, y: 20 },
		animate: { opacity: 1, y: 0 },
		exit: { opacity: 0, y: -20 },
		transition: { duration: 0.4, ease: "easeOut" },
	},

	pulse: {
		animate: {
			scale: [1, 1.02, 1],
			opacity: [0.8, 1, 0.8],
			transition: {
				duration: 2,
				repeat: Number.POSITIVE_INFINITY,
				ease: "easeInOut",
			},
		},
	},

	iconPopIn: {
		initial: { scale: 0, rotate: -180 },
		animate: { scale: 1, rotate: 0 },
		transition: {
			type: "spring",
			damping: 15,
			stiffness: 200,
			delay: 0.2,
		},
	},
};

// Utility functions
const getFileIcon = (fileType: string) => {
	if (fileType === "application/pdf") {
		return <FileText className="h-8 w-8 text-blue-500 dark:text-blue-400" />;
	}
	if (fileType.startsWith("image/")) {
		return <Image className="h-8 w-8 text-blue-500 dark:text-blue-400" />;
	}
	return <FileText className="h-8 w-8 text-gray-500 dark:text-gray-400" />;
};

const formatFileSize = (bytes: number): string => {
	return `${(bytes / (1024 * 1024)).toFixed(2)} MB`;
};
// Sub-components
const FileDetails = ({ file, onClear }: FileDetailsProps) => (
	<motion.div
		initial={{ opacity: 0, y: 20, scale: 0.95 }}
		animate={{ opacity: 1, y: 0, scale: 1 }}
		exit={{ opacity: 0, y: -20, scale: 0.95 }}
		transition={{ type: "spring", damping: 20, stiffness: 300 }}
		className="relative overflow-hidden z-40 bg-white/80 dark:bg-neutral-900/80 backdrop-blur-sm flex flex-col items-start justify-start p-4 w-full mx-auto rounded-lg shadow-lg border border-gray-200/50 dark:border-neutral-800/50"
	>
		<div className="flex justify-between w-full items-center gap-4">
			<div className="flex items-center gap-3 flex-1 min-w-0">
				<motion.div className="flex-shrink-0" {...animations.iconPopIn}>
					{getFileIcon(file.type)}
				</motion.div>
				<div className="flex-1 min-w-0">
					<motion.p
						initial={{ opacity: 0, x: -20 }}
						animate={{ opacity: 1, x: 0 }}
						transition={{ delay: 0.3, duration: 0.4 }}
						className="text-base font-medium text-neutral-700 dark:text-neutral-300 truncate"
					>
						{file.name}
					</motion.p>
					<motion.p
						initial={{ opacity: 0, x: -20 }}
						animate={{ opacity: 1, x: 0 }}
						transition={{ delay: 0.4, duration: 0.4 }}
						className="text-sm text-neutral-500 dark:text-neutral-400"
					>
						{formatFileSize(file.size)}
					</motion.p>
				</div>
			</div>

			{onClear && (
				<motion.div
					initial={{ opacity: 0, scale: 0.5 }}
					animate={{ opacity: 1, scale: 1 }}
					whileHover={{ scale: 1.1 }}
					whileTap={{ scale: 0.9 }}
					transition={{ type: "spring", stiffness: 400, damping: 17 }}
				>
					<Button
						variant="ghost"
						size="icon"
						className="h-8 w-8 rounded-full hover:bg-red-100 dark:hover:bg-red-900/30 text-red-600 dark:text-red-400"
						onClick={onClear}
					>
						<X className="h-4 w-4" />
					</Button>
				</motion.div>
			)}
		</div>
	</motion.div>
);

const LanguageSelector = ({
	language,
	setLanguage,
}: Pick<UploadSectionProps, "language" | "setLanguage">) => (
	<motion.div className="space-y-1.5 max-w-[180px]" {...animations.fadeInUp}>
		<Label htmlFor="language-select" className="text-sm font-medium">
			Programming Language
		</Label>
		<Select
			onValueChange={(value: SupportedLanguage) => setLanguage(value)}
			value={language || undefined}
		>
			<SelectTrigger id="language-select">
				<SelectValue placeholder="Select..." />
			</SelectTrigger>
			<SelectContent>
				{SUPPORTED_LANGUAGES.map(({ value, label, icon }) => (
					<SelectItem key={value} value={value}>
						<div className="flex items-center gap-2">
							<img src={icon} alt={`${label} icon`} className="w-5 h-5" />
							{label}
						</div>
					</SelectItem>
				))}
			</SelectContent>
		</Select>
	</motion.div>
);

const DropzoneContent = ({
	isDragActive,
	file,
	onClearFile,
}: Pick<UploadSectionProps, "isDragActive" | "file" | "onClearFile">) => (
	<AnimatePresence mode="wait">
		<div className="relative z-10">
			<div className="flex flex-col items-center justify-center min-h-[140px]">
				{file ? (
					<FileDetails file={file} onClear={onClearFile} />
				) : (
					<motion.div
						initial={{ opacity: 0, scale: 0.9 }}
						animate={{ opacity: 1, scale: 1 }}
						exit={{ opacity: 0, scale: 0.9 }}
						transition={{ duration: 0.4 }}
						className="text-center relative z-10"
					>
						<motion.div
							className="rounded-full bg-blue-50 dark:bg-blue-900/30 p-4 mx-auto mb-4 w-fit"
							whileHover={{
								scale: 1.05,
								boxShadow: "0 0 20px rgba(59, 130, 246, 0.5)",
							}}
							whileTap={{ scale: 0.95 }}
							{...animations.pulse}
						>
							<Upload className="h-8 w-8 text-blue-500 dark:text-blue-400" />
						</motion.div>

						<AnimatePresence mode="wait">
							{isDragActive ? (
								<motion.div
									key="drag-active"
									initial={{ opacity: 0, y: 10, scale: 0.95 }}
									animate={{ opacity: 1, y: 0, scale: 1 }}
									exit={{ opacity: 0, y: -10, scale: 0.95 }}
									transition={{ duration: 0.3 }}
									className="text-lg font-medium text-blue-600 dark:text-blue-400"
								>
									Drop your file here
								</motion.div>
							) : (
								<motion.div
									key="drag-inactive"
									initial={{ opacity: 0, y: 10 }}
									animate={{ opacity: 1, y: 0 }}
									exit={{ opacity: 0, y: -10 }}
									transition={{ duration: 0.3 }}
								>
									<motion.div
										initial={{ opacity: 0 }}
										animate={{ opacity: 1 }}
										transition={{ delay: 0.2 }}
									>
										<span className="text-blue-600 dark:text-blue-400 font-medium">
											Upload a file
										</span>
										<span className="text-slate-600 dark:text-slate-400 ml-1">
											or drag and drop
										</span>
									</motion.div>
									<motion.p
										className="text-sm text-slate-500"
										initial={{ opacity: 0 }}
										animate={{ opacity: 1 }}
										transition={{ delay: 0.3 }}
									>
										PNG, JPG, JPEG, PDF up to 5MB
									</motion.p>
								</motion.div>
							)}
						</AnimatePresence>
					</motion.div>
				)}
			</div>
		</div>
	</AnimatePresence>
);

// Main component
export const UploadSection = ({
	language,
	setLanguage,
	file,
	getRootProps,
	getInputProps,
	isProcessing,
	onUpload,
	isDragActive,
	onClearFile,
}: UploadSectionProps) => {
	const getDropzoneClassName = (isDragActive: boolean) =>
		`p-6 block rounded-lg cursor-pointer w-full relative overflow-hidden border-2 border-dashed transition-colors duration-200 ${
			isDragActive
				? "border-blue-500 dark:border-blue-400 bg-blue-50/50 dark:bg-blue-900/20"
				: "border-gray-200 dark:border-neutral-800 hover:border-blue-400 dark:hover:border-blue-500"
		}`;

	return (
		<div className="mx-auto w-full lg:max-w-xl">
			{/* Header Section */}
			<motion.div
				initial={{ opacity: 0, y: 30 }}
				animate={{ opacity: 1, y: 0 }}
				transition={{ duration: 0.6, ease: "easeOut" }}
			>
				<motion.h1
					className="text-3xl lg:text-4xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 dark:from-blue-400 dark:to-indigo-400 bg-clip-text text-transparent mb-2"
					initial={{ opacity: 0, y: 20 }}
					animate={{ opacity: 1, y: 0 }}
					transition={{ delay: 0.2, duration: 0.5 }}
				>
					paper2code
				</motion.h1>
				<motion.p
					className="mb-6 text-slate-600 dark:text-slate-300"
					initial={{ opacity: 0 }}
					animate={{ opacity: 1 }}
					transition={{ delay: 0.4, duration: 0.5 }}
				>
					Execute your handwritten code with ease.
				</motion.p>
			</motion.div>

			{/* Main Content */}
			<motion.div
				className="space-y-4"
				initial={{ opacity: 0 }}
				animate={{ opacity: 1 }}
				transition={{ duration: 0.5, delay: 0.3 }}
			>
				<LanguageSelector language={language} setLanguage={setLanguage} />

				<motion.div
					className="space-y-1.5"
					{...animations.fadeInUp}
					transition={{ delay: 0.6 }}
				>
					<Label className="text-sm font-medium">Handwritten Code File</Label>
					<div {...getRootProps()}>
						<motion.div
							whileTap={{ scale: 0.995 }}
							className={getDropzoneClassName(isDragActive || false)}
						>
							<input {...getInputProps()} />
							<DropzoneContent
								isDragActive={isDragActive}
								file={file}
								onClearFile={onClearFile}
							/>
						</motion.div>
					</div>
				</motion.div>

				<motion.div {...animations.fadeInUp} transition={{ delay: 0.7 }}>
					<Button
						onClick={onUpload}
						disabled={isProcessing || !file || !language}
						className="w-full bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 dark:from-blue-500 dark:to-indigo-500 dark:hover:from-blue-600 dark:hover:to-indigo-600 text-white transition-all duration-200"
						size="lg"
					>
						{isProcessing ? (
							<LoadingSpinner className="h-5 w-5 border-white border-t-transparent" />
						) : (
							<motion.div
								className="flex items-center"
								whileHover={{ scale: 1.02 }}
								whileTap={{ scale: 0.98 }}
							>
								<Upload className="mr-2 h-4 w-4" />
								Process
							</motion.div>
						)}
					</Button>
				</motion.div>
			</motion.div>
		</div>
	);
};

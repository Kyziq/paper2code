import { FileText } from "lucide-react";
import { Upload } from "lucide-react";
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
import { cn } from "~/lib/utils";
import { SUPPORTED_LANGUAGES, type SupportedLanguage } from "~shared/constants";

interface UploadSectionProps {
  language: SupportedLanguage | null;
  setLanguage: (language: SupportedLanguage) => void;
  file: File | null;
  getRootProps: <T extends DropzoneRootProps>(props?: T) => T;
  getInputProps: <T extends DropzoneInputProps>(props?: T) => T;
  isProcessing: boolean;
  onUpload: () => void;
}

export const UploadSection = ({
  language,
  setLanguage,
  file,
  getRootProps,
  getInputProps,
  isProcessing,
  onUpload,
}: UploadSectionProps) => {
  return (
    <div className="mx-auto w-full lg:max-w-xl">
      <h1 className="text-3xl lg:text-4xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 dark:from-blue-400 dark:to-indigo-400 bg-clip-text text-transparent mb-2">
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
            onValueChange={(value: SupportedLanguage) => setLanguage(value)}
            value={language || undefined}
          >
            <SelectTrigger id="language-select">
              <SelectValue placeholder="Choose..." />
            </SelectTrigger>
            <SelectContent>
              {SUPPORTED_LANGUAGES.map(({ value, label, icon }) => (
                <SelectItem key={value} value={value}>
                  <div className="flex items-center gap-2">
                    <img
                      src={icon}
                      alt={`${label} icon`}
                      className="w-5 h-5"
                    />
                    {label}
                  </div>
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
            <div className="px-4 sm:px-6 py-8 sm:py-10 text-center cursor-pointer">
              <input {...getInputProps()} />
              {file ? (
                <div className="text-slate-700 dark:text-slate-200">
                  <FileText className="mx-auto h-10 sm:h-12 w-10 sm:w-12 text-blue-500 dark:text-blue-400 mb-4" />
                  <p className="font-medium">{file.name}</p>
                  <p className="mt-1 text-sm text-slate-500">
                    Click or drag to replace
                  </p>
                </div>
              ) : (
                <div>
                  <FileText className="mx-auto h-10 sm:h-12 w-10 sm:w-12 text-blue-500 dark:text-blue-400" />
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
          onClick={onUpload}
          disabled={isProcessing}
          className="w-full"
          size="lg"
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
  );
};

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
  type SupportedLanguage,
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
    mutationFn: (data: FileUploadParams) => uploadFile(data),
    onSuccess: (result) => {
      if (result.data) {
        setConsoleMessage(result.message);
        setOcrResult(result.data.code);
        setFileUrl(result.data.fileUrl);
        toast.success("File uploaded successfully. Proceeding to execution...");
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
      toast.error("Error uploading file. Check the console for details.");
    },
  });

  const executeMutation = useMutation({
    mutationFn: (params: FileExecutionParams) =>
      executeCode(params.code, params.language),
    onSuccess: (response) => {
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
                  onUpload={() => {
                    if (!language)
                      return toast.error("Please select a language.");
                    if (!file) return toast.error("Please upload a file.");
                    uploadMutation.mutate({ file, language });
                  }}
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
            // Desktop layout - side by side with resizable panels
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
                    onUpload={() => {
                      if (!language)
                        return toast.error("Please select a language.");
                      if (!file) return toast.error("Please upload a file.");
                      uploadMutation.mutate({ file, language });
                    }}
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

import { create } from "zustand";
import type { SupportedLanguage } from "~shared/constants";

interface Store {
	file: File | null;
	detectedLanguage: SupportedLanguage | null;
	consoleMessage: string;
	ocrResult: string;
	fileUrl?: string;
	setFile: (file: File | null) => void;
	setDetectedLanguage: (language: SupportedLanguage | null) => void;
	setConsoleMessage: (consoleMessage: string) => void;
	setOcrResult: (result: string) => void;
	setFileUrl: (url: string) => void;
}

export const useStore = create<Store>()((set) => ({
	file: null,
	detectedLanguage: null,
	consoleMessage: "",
	ocrResult: "",
	fileUrl: "",
	setFile: (file) => set({ file }),
	setDetectedLanguage: (detectedLanguage) => set({ detectedLanguage }),
	setConsoleMessage: (consoleMessage) => set({ consoleMessage }),
	setOcrResult: (ocrResult) => set({ ocrResult }),
	setFileUrl: (fileUrl) => set({ fileUrl }),
}));

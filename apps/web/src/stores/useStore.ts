import { create } from "zustand";
import type { SupportedLanguage } from "~shared/constants";

interface Store {
	file: File | null;
	language: SupportedLanguage | null;
	consoleMessage: string;
	ocrResult: string;
	fileUrl?: string;
	setFile: (file: File | null) => void;
	setLanguage: (language: SupportedLanguage | null) => void;
	setConsoleMessage: (consoleMessage: string) => void;
	setOcrResult: (result: string) => void;
	setFileUrl: (url: string) => void;
}

export const useStore = create<Store>()((set) => ({
	file: null,
	language: null,
	consoleMessage: "",
	ocrResult: "",
	fileUrl: "",
	setFile: (file) => set({ file }),
	setLanguage: (language) => set({ language }),
	setConsoleMessage: (consoleMessage) => set({ consoleMessage }),
	setOcrResult: (ocrResult) => set({ ocrResult }),
	setFileUrl: (fileUrl) => set({ fileUrl }),
}));

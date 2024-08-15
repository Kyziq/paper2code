import { create } from 'zustand';

interface Store {
  file: File | null;
  language: string | null;
  consoleMessage: string;
  setFile: (file: File | null) => void;
  setLanguage: (language: string | null) => void;
  setConsoleMessage: (consoleMessage: string) => void;
}

const useStore = create<Store>()((set) => ({
  file: null,
  language: null,
  consoleMessage: '',
  setFile: (file) => set({ file }),
  setLanguage: (language) => set({ language }),
  setConsoleMessage: (consoleMessage) => set({ consoleMessage }),
}));

export default useStore;

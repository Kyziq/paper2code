import { create } from 'zustand';

interface Store {
  file: File | null;
  language: string | null;
  message: string;
  setFile: (file: File | null) => void;
  setLanguage: (language: string | null) => void;
  setMessage: (message: string) => void;
}

const useStore = create<Store>()((set) => ({
  file: null,
  language: null,
  message: '',
  setFile: (file) => set({ file }),
  setLanguage: (language) => set({ language }),
  setMessage: (message) => set({ message }),
}));

export default useStore;

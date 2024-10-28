import { create } from "zustand";
import { persist } from "zustand/middleware";

type Theme = "light" | "dark";

interface ThemeStore {
	theme: Theme;
	setTheme: (theme: Theme) => void;
}

const getSystemTheme = (): Theme => {
	// Check if we're in a browser and if the user has a dark mode preference
	if (
		typeof window !== "undefined" &&
		window.matchMedia("(prefers-color-scheme: dark)").matches
	) {
		return "dark";
	}
	// Default to light if no preference or not in browser
	return "light";
};

export const useThemeStore = create<ThemeStore>()(
	persist(
		(set) => ({
			theme: getSystemTheme(),
			setTheme: (theme) => set({ theme }),
		}),
		{
			name: "theme-storage",
		},
	),
);

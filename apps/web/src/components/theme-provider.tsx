import { useEffect } from "react";
import type React from "react";
import { useThemeStore } from "../stores/useThemeStore";

type ThemeProviderProps = {
	children: React.ReactNode;
};

export function ThemeProvider({ children }: ThemeProviderProps) {
	const { theme } = useThemeStore();

	useEffect(() => {
		const root = window.document.documentElement;
		root.classList.remove("light", "dark");
		root.classList.add(theme);
	}, [theme]);

	return <>{children}</>;
}

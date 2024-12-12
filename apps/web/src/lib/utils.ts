import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
	return twMerge(clsx(inputs));
}

export function isMobile(): boolean {
	// Check if window is defined (to avoid SSR issues)
	if (typeof window === "undefined") return false;

	// Check for touch support
	const hasTouch = "ontouchstart" in window || navigator.maxTouchPoints > 0;

	// Check screen width (1024px is typical tablet/desktop breakpoint)
	const isNarrowScreen = window.innerWidth < 1024;

	// Check user agent for mobile strings
	const userAgent = window.navigator.userAgent.toLowerCase();
	const mobileKeywords = ["android", "iphone", "ipad"];
	const isMobileDevice = mobileKeywords.some((keyword) =>
		userAgent.includes(keyword),
	);

	// Use a combination of checks for more reliable detection
	return hasTouch && (isNarrowScreen || isMobileDevice);
}

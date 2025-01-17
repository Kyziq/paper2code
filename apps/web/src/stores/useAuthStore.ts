import { create } from "zustand";
import { persist } from "zustand/middleware";
import type { GoogleUser } from "~shared/types/auth";

// Store state
interface AuthState {
	user: GoogleUser | null;
	isAuthenticated: boolean;
	setUser: (user: GoogleUser | null) => void;
	logout: () => void;
}

export const useAuthStore = create<AuthState>()(
	persist(
		(set) => ({
			user: null,
			isAuthenticated: false,
			setUser: (user: GoogleUser | null) =>
				set({ user, isAuthenticated: !!user }),
			logout: () => set({ user: null, isAuthenticated: false }),
		}),
		{
			name: "auth-storage",
		},
	),
);

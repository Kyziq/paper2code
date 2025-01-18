import { useEffect } from "react";
import { toast } from "sonner";
import { useAuthStore } from "~/stores/useAuthStore";

// Minimal Google global types needed for the button
declare global {
	interface Window {
		google?: {
			accounts: {
				id: {
					initialize: (config: {
						client_id: string;
						callback: (response: { credential: string }) => void;
						auto_select?: boolean;
					}) => void;
					prompt: () => void;
				};
			};
		};
	}
}

export function GoogleAuthButton() {
	const { setUser } = useAuthStore();

	useEffect(() => {
		// Load the Google Identity Services script
		const script = document.createElement("script");
		script.src = "https://accounts.google.com/gsi/client";
		script.async = true;
		script.defer = true;
		document.body.appendChild(script);

		script.onload = () => {
			if (window.google) {
				window.google.accounts.id.initialize({
					client_id: import.meta.env.VITE_GOOGLE_CLIENT_ID,
					callback: handleCredentialResponse,
					auto_select: false,
				});

				const buttonContainer = document.getElementById("google-signin-button");
				if (!buttonContainer) return;
				window.google.accounts.id.renderButton(buttonContainer, {
					type: "standard",
					theme: "outline",
					size: "large",
					text: "signin_with",
					shape: "rectangular",
					logo_alignment: "left",
					width: 200,
				});
			}
		};

		return () => {
			script.remove();
		};
	}, []);

	// biome-ignore lint/suspicious/noExplicitAny: <Google's API response type>
	const handleCredentialResponse = async (response: any) => {
		try {
			// Verify the token with your backend
			const res = await fetch(
				`${import.meta.env.VITE_API_BASE_URL}/api/auth/google/verify`,
				{
					method: "POST",
					headers: {
						"Content-Type": "application/json",
					},
					body: JSON.stringify({ token: response.credential }),
				},
			);

			if (!res.ok) {
				throw new Error("Failed to verify token");
			}

			const { user } = await res.json();

			// Store the user data
			setUser(user);

			toast.success("Successfully signed in!", {
				description: `Hi ${user.name}!`,
			});
		} catch (error) {
			console.error("Authentication error:", error);
			toast.error("Authentication failed", {
				description: "Unable to sign in with Google. Please try again.",
			});
		}
	};

	return <div id="google-signin-button" className="scale-90 -mr-2" />;
}

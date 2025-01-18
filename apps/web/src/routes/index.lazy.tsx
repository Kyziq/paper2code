import { Navigate, createLazyFileRoute } from "@tanstack/react-router";
import { GoogleAuthButton } from "~/components/google-auth-button";
import { useAuthStore } from "~/stores/useAuthStore";

export const Route = createLazyFileRoute("/")({
	component: RouteComponent,
});

function RouteComponent() {
	const { isAuthenticated } = useAuthStore();

	return (
		<main className="flex-grow relative">
			{isAuthenticated ? (
				<Navigate to="/app" />
			) : (
				<div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2">
					<GoogleAuthButton />
				</div>
			)}
		</main>
	);
}

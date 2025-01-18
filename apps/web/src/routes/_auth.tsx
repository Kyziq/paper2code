import { Outlet, createFileRoute, redirect } from "@tanstack/react-router";

export const Route = createFileRoute("/_auth")({
	loader: ({ context }) => {
		if (!context.auth.isAuthenticated) {
			throw redirect({
				to: "/",
				// search: {
				// 	redirect: location.href,
				// },
			});
		}
	},
	component: AuthLayout,
});

function AuthLayout() {
	return <Outlet />;
}

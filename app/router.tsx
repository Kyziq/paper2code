import {
	Link,
	createRouter as createTanStackRouter,
} from "@tanstack/react-router";
import { routeTree } from "~/routeTree.gen";

export function createRouter() {
	const router = createTanStackRouter({
		routeTree,
		defaultPreload: "intent",
		defaultNotFoundComponent: () => {
			return (
				<div>
					<p>404 - Page not found</p>
					<Link to="/">Go home</Link>
				</div>
			);
		},
	});

	return router;
}

declare module "@tanstack/react-router" {
	interface Register {
		router: ReturnType<typeof createRouter>;
	}
}

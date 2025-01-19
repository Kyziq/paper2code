import React from "react";
import ReactDOM from "react-dom/client";
import "~/styles/fonts.css";
import "~/styles/index.css";

import { RouterProvider, createRouter } from "@tanstack/react-router";
import { Toaster } from "~/components/ui/sonner";

import { useAuthStore } from "~/stores/useAuthStore";

// Import the generated route tree
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { HelmetProvider } from "react-helmet-async";
import { routeTree } from "~/routeTree.gen";

// Create a new router instance
const router = createRouter({
	routeTree,
	context: {
		// Initial context - will be updated by the RouterProvider
		auth: {
			user: null,
			isAuthenticated: false,
		},
	},
});

// Register the router instance for type safety
declare module "@tanstack/react-router" {
	interface Register {
		router: typeof router;
	}
}

// Create a client
const queryClient = new QueryClient();

// Wrap RouterProvider to provide auth context
function App() {
	const { user, isAuthenticated } = useAuthStore();

	return (
		<React.StrictMode>
			<HelmetProvider>
				<QueryClientProvider client={queryClient}>
					<RouterProvider
						router={router}
						context={{
							auth: {
								user,
								isAuthenticated,
							},
						}}
					/>
					<Toaster
						position="bottom-right"
						richColors
						closeButton
						duration={5000}
					/>
				</QueryClientProvider>
			</HelmetProvider>
		</React.StrictMode>
	);
}

const rootElement = document.getElementById("root");
if (rootElement) {
	ReactDOM.createRoot(rootElement).render(<App />);
}

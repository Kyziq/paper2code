import React from "react";
import ReactDOM from "react-dom/client";
import "./styles/fonts.css";
import "./styles/index.css";

import { RouterProvider, createRouter } from "@tanstack/react-router";
import { Toaster } from "~/components/ui/sonner";

// Import the generated route tree
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { routeTree } from "./routeTree.gen";

// Create a new router instance
const router = createRouter({ routeTree });

// Register the router instance for type safety
declare module "@tanstack/react-router" {
	interface Register {
		router: typeof router;
	}
}

// Create a client
const queryClient = new QueryClient();

const rootElement = document.getElementById("root");
if (rootElement) {
	ReactDOM.createRoot(rootElement).render(
		<React.StrictMode>
			<QueryClientProvider client={queryClient}>
				<RouterProvider router={router} />
				<Toaster
					position="bottom-right"
					richColors
					closeButton
					duration={5000}
				/>
			</QueryClientProvider>
		</React.StrictMode>,
	);
}

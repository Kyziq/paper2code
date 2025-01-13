import path from "node:path";
import { TanStackRouterVite } from "@tanstack/router-vite-plugin";
import react from "@vitejs/plugin-react-swc";
import { defineConfig } from "vite";

export default defineConfig({
	base: "/paper2code/",
	plugins: [TanStackRouterVite(), react()],
	resolve: {
		alias: {
			"~": path.resolve(__dirname, "./src"),
			"~shared": path.resolve(__dirname, "../../packages/shared"),
		},
	},
});

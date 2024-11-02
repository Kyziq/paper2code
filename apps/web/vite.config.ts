import path, { resolve } from "node:path";
import { TanStackRouterVite } from "@tanstack/router-plugin/vite";
import react from "@vitejs/plugin-react-swc";
import dotenv from "dotenv";
import { defineConfig } from "vite";

dotenv.config({ path: resolve(__dirname, "../../.env") });

// https://vitejs.dev/config/
export default defineConfig({
	plugins: [TanStackRouterVite(), react()],
	resolve: {
		alias: {
			"@": path.resolve(__dirname, "./src"),
			"~/shared": path.resolve(__dirname, "../../packages/shared"),
		},
	},
	envPrefix: "VITE_API_BASE_URL",
});

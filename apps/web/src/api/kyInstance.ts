import ky from "ky";
import type { ErrorResponse } from "~shared/types";
import { formatTimestamp } from "~shared/utils/formatting.ts";

const apiBaseUrl = import.meta.env.VITE_API_BASE_URL;
const enableLogging = import.meta.env.VITE_ENABLE_LOGGING === "true";

if (!apiBaseUrl) {
	throw new Error("API_BASE_URL environment variable is not set");
}

// Helper function to safely stringify objects for logging
const safeStringify = (obj: unknown) => {
	try {
		return JSON.stringify(obj, null, 2);
	} catch (error) {
		return String(obj);
	}
};

const kyInstance = ky.extend({
	prefixUrl: `${apiBaseUrl}/api`,
	timeout: 30000,
	hooks: {
		beforeRequest: [
			(request) => {
				if (enableLogging) {
					const timestamp = formatTimestamp(new Date());
					console.group(`🌐 API Request - ${timestamp}`);
					console.log(`${request.method} ${request.url}`);
					console.log(
						"Headers:",
						Object.fromEntries(request.headers.entries()),
					);
					console.groupEnd();
				}
			},
		],
		beforeError: [
			(error) => {
				if (enableLogging) {
					const timestamp = formatTimestamp(new Date());
					console.group(`❌ API Error - ${timestamp}`);
					console.error(`${error.name}: ${error.message}`);
					console.error("Request:", error.request);
					console.error("Response:", error.response);
					console.groupEnd();
				}
				return error;
			},
		],
		afterResponse: [
			async (request, _options, response) => {
				if (enableLogging) {
					const timestamp = formatTimestamp(new Date());
					console.group(`✅ API Response - ${timestamp}`);
					console.log(`${request.method} ${request.url}`);
					console.log("Status:", response.status);
					console.log(
						"Headers:",
						Object.fromEntries(response.headers.entries()),
					);

					// Only log response body for non-binary content
					const contentType = response.headers.get("content-type");
					if (contentType?.includes("application/json")) {
						try {
							const clonedResponse = response.clone();
							const responseData = await clonedResponse.json();
							console.log("Response:", safeStringify(responseData));
						} catch (error) {
							console.log("Could not parse response body");
						}
					}

					console.groupEnd();
				}

				if (!response.ok) {
					const errorData: ErrorResponse = await response.json();
					throw new Error(errorData.message || `Error ${errorData.statusCode}`);
				}
			},
		],
	},
	retry: 0,
});

export default kyInstance;

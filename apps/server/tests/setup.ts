/**
 * Test Setup Configuration
 * Disables logging during test execution for cleaner output.
 */

import { afterAll, beforeAll } from "bun:test";
import { logger } from "../src/utils/logger";

// Store original logger methods
const originalLogger = { ...logger };

// Mock logger methods
const mockLogger = () => {
	for (const key of Object.keys(logger)) {
		if (typeof logger[key] === "function") {
			logger[key] = () => {};
		}
	}
};

// Restore original logger methods
const restoreLogger = () => {
	for (const key of Object.keys(originalLogger)) {
		logger[key] = originalLogger[key];
	}
};

beforeAll(() => {
	mockLogger();
});

afterAll(() => {
	restoreLogger();
});

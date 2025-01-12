import { describe, expect, test } from "bun:test";
import type { SupportedLanguage } from "../../../packages/shared/constants";
import { runContainer } from "../src/services/docker";

describe("Code Execution Tests", () => {
	// Test Case 1: Python Execution
	test("should execute Python print statement", async () => {
		// Arrange (setup the test data)
		const code = `print("Hello Haziq")`;
		const language = "python" as SupportedLanguage;

		// Act (perform the action being tested)
		const result = await runContainer(code, language);

		// Assert (verify the expected outcome)
		expect(result.success).toBe(true);
		expect(result.output.trim()).toBe("Hello Haziq");
	});

	// Test Case 2: Java Execution
	test("should execute Java class with main method", async () => {
		const code = `
      public class Main {
          public static void main(String[] args) {
              System.out.println("Hello Haziq");
          }
      }
    `;
		const result = await runContainer(code, "java" as SupportedLanguage);

		expect(result.success).toBe(true);
		expect(result.output.trim()).toBe("Hello Haziq");
	});

	// Test Case 3: C++ Execution
	test("should execute C++ program with cout", async () => {
		const code = `
      #include <iostream>
      using namespace std;
      int main() {
          cout << "Hello Haziq" << endl;
          return 0;
      }
    `;
		const result = await runContainer(code, "cpp" as SupportedLanguage);

		expect(result.success).toBe(true);
		expect(result.output.trim()).toBe("Hello Haziq");
	});

	// Test Case 4: Error handling
	test("should return error when Python syntax is invalid", async () => {
		const code = `print("Hello Khairul Haziq"`; // Missing closing parenthesis
		const result = await runContainer(code, "python" as SupportedLanguage);

		expect(result.success).toBe(false);
		expect(result.output).toContain("SyntaxError");
	});

	// Test Case 5: Empty Code
	test("should handle empty code input", async () => {
		const code = "";
		const result = await runContainer(code, "python" as SupportedLanguage);

		expect(result.success).toBe(true);
		expect(result.output).toContain(
			"Program executed successfully with no output",
		);
	});

	// Test Case 6: Multiple Print Statements
	test("should process multiple print statements", async () => {
		const code = `
      print("Line 1")
      print("Line 2")
      print("Line 3")
    `;
		const result = await runContainer(code, "python" as SupportedLanguage);

		expect(result.success).toBe(true);
		expect(result.output.split("\n").length).toBe(3);
	});
});
import { describe, expect, test } from "bun:test";
import { detectLanguage } from "../src/services/detect-language";

describe("Code Language Detection Tests", () => {
	// Test Case 1: Python Language Detection
	test("should detect Python language", async () => {
		// Arrange
		const code = `print("Hello Haziq")`;
		// Act
		const result = await detectLanguage(code);
		// Assert
		expect(result.language).toBe("python");
	});

	// Test Case 2: Java Language Detection
	test("should detect Java language", async () => {
		// Arrange
		const code = `public class Main {
  public static void main(String[] args) {
    System.out.println("Hello Haziq");
  }
}`;
		// Act
		const result = await detectLanguage(code);
		// Assert
		expect(result.language).toBe("java");
	});

	// Test Case 3: C++ Language Detection
	test("should detect C++ language", async () => {
		// Arrange
		const code = `#include <iostream>
using namespace std;
int main() {
  cout << "Hello Haziq" << endl;
  return 0;
}`;
		// Act
		const result = await detectLanguage(code);
		// Assert
		expect(result.language).toBe("cpp");
	});

	// Test 4 and 5 are for not supported languages
	// Test Case 4: Go Language Detection
	test("should detect Go language", async () => {
		// Arrange
		const code = `package main
import "fmt"
func main() {
  fmt.Println("Hello Haziq")
}`;
		// Act
		const result = await detectLanguage(code);
		// Assert
		expect(result.language).toBe("go"); // This will fail, as Go is not supported
		// expect(result.language).toBeNull();
	});

	// Test Case 5: JavaScript Language Detection
	test("should detect JavaScript language", async () => {
		// Arrange
		const code = `console.log("Hello Haziq")`;
		// Act
		const result = await detectLanguage(code);
		// Assert
		expect(result.language).toBe("javascript"); // This will fail, as JavaScript is not supported
		// expect(result.language).toBeNull();
	});
});

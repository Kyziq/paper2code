// apps/server/tests/enhance.test.ts

import { describe, expect, test } from "bun:test";
import type { SupportedLanguage } from "../../../packages/shared/constants";
import { enhanceCode } from "../src/services/enhance";

describe("Code Enhancement Tests", () => {
	// Test Case 1: Python Indentation Fix
	test("should fix Python indentation", async () => {
		// Arrange
		const code = `def calculate_sum(a,b):
for i in range(a):
print(i)
return a+b`;
		const language = "python" as SupportedLanguage;
		// Act
		const result = await enhanceCode(code, language);
		// Assert
		expect(result).toContain("def calculate_sum(a, b):");
		expect(result).toContain("    for i in range(a):");
		expect(result).toContain("        print(i)");
		expect(result).toContain("    return a + b");
	});

	// Test Case 2: Java Class Structure Fix
	test("should fix Java class structure", async () => {
		// Arrange
		const code = `class test {
void main(String[] args) {
System.out.println("Hello");
}
}`;
		const language = "java" as SupportedLanguage;
		// Act
		const result = await enhanceCode(code, language);
		// Assert
		expect(result).toContain("public class");
		expect(result).toContain("public static void main");
		expect(result).toContain("System.out.println");
	});

	// Test Case 3: C++ Syntax Fix
	test("should fix C++ syntax", async () => {
		// Arrange
		const code = `#include<iostream>
using namespace std
int main(){
	cout << "Hello"
	return 0
}`;
		const language = "cpp" as SupportedLanguage;
		// Act
		const result = await enhanceCode(code, language);
		// Assert
		expect(result).toContain("using namespace std;");
		expect(result).toContain('cout << "Hello";');
		expect(result).toContain("return 0;");
	});
});

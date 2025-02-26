/**
 * Tests for Custom Mask Parser
 */

import { describe, it, expect } from "vitest";
import { parseCustomMask, validateDigitsOnly } from "../js/customMask.js";

describe("validateDigitsOnly", () => {
  it("should validate strings with only digits", () => {
    expect(() => validateDigitsOnly("123456", "Test")).not.toThrow();
    expect(validateDigitsOnly("123456", "Test")).toBe(true);
  });

  it("should throw error for strings with non-digit characters", () => {
    expect(() => validateDigitsOnly("123abc", "Test")).toThrow();
    expect(() => validateDigitsOnly("123-456", "Test")).toThrow();
    expect(() => validateDigitsOnly("", "Test")).toThrow();
  });
});

describe("parseCustomMask", () => {
  it("should parse prefix/length format correctly", () => {
    const result = parseCustomMask("123/15");
    expect(result).toEqual({
      prefix: "123",
      length: 15,
      isExact: false,
    });
  });

  it("should parse exact number format correctly", () => {
    const result = parseCustomMask("1234567890123456");
    expect(result).toEqual({
      prefix: "1234567890123456",
      length: 16,
      isExact: true,
    });
  });

  it("should handle whitespace trimming", () => {
    const result = parseCustomMask("  456/16  ");
    expect(result).toEqual({
      prefix: "456",
      length: 16,
      isExact: false,
    });
  });

  it("should handle valid length boundaries", () => {
    // Minimum valid length (10 digits)
    const result1 = parseCustomMask("123/10");
    expect(result1).toEqual({
      prefix: "123",
      length: 10,
      isExact: false,
    });

    // Maximum valid length (19 digits)
    const result2 = parseCustomMask("123/19");
    expect(result2).toEqual({
      prefix: "123",
      length: 19,
      isExact: false,
    });
  });

  describe("error handling", () => {
    it("should reject invalid input types", () => {
      expect(() => parseCustomMask("")).toThrow();
      expect(() => parseCustomMask("   ")).toThrow();
      expect(() => parseCustomMask(null)).toThrow();
      expect(() => parseCustomMask(undefined)).toThrow();
      expect(() => parseCustomMask(123)).toThrow();
    });

    it("should reject invalid formats", () => {
      expect(() => parseCustomMask("123/456/789")).toThrow(); // multiple slashes
      expect(() => parseCustomMask("abc/16")).toThrow(); // non-numeric prefix
      expect(() => parseCustomMask("123/abc")).toThrow(); // non-numeric length
    });

    it("should reject invalid lengths", () => {
      expect(() => parseCustomMask("123456789")).toThrow(); // too short exact number
      expect(() => parseCustomMask("12345678901234567890")).toThrow(); // too long exact number
      expect(() => parseCustomMask("123/9")).toThrow(); // too short length
      expect(() => parseCustomMask("123/20")).toThrow(); // too long length
      expect(() => parseCustomMask("1234567890/10")).toThrow(); // prefix too long
    });
  });
});

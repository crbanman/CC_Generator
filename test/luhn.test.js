/**
 * Tests for Luhn algorithm implementation
 */

import { describe, it, expect } from "vitest";
import { validateLuhn, calculateCheckDigit } from "../js/luhn.js";

describe("validateLuhn", () => {
  // Test valid credit card numbers
  it("should validate a valid credit card number", () => {
    expect(validateLuhn("4532015112830366")).toBe(true);
  });

  it("should validate a card with non-numeric characters", () => {
    expect(validateLuhn("4532 0151 1283 0366")).toBe(true);
    expect(validateLuhn("4532-0151-1283-0366")).toBe(true);
  });

  // Test invalid credit card numbers
  it("should reject an invalid card", () => {
    expect(validateLuhn("4532015112830367")).toBe(false);
  });

  // Test error handling
  it("should throw error for invalid input", () => {
    expect(() => validateLuhn("")).toThrow();
    expect(() => validateLuhn("45320151X1283036")).toThrow();
  });
});

describe("calculateCheckDigit", () => {
  it("should calculate correct check digits for various card numbers", () => {
    expect(calculateCheckDigit("411111111111111")).toBe(1);
    expect(calculateCheckDigit("37828224631000")).toBe(5);
    expect(calculateCheckDigit("601111111111111")).toBe(7);
  });

  it("should handle non-numeric characters correctly", () => {
    expect(calculateCheckDigit("4111 1111 1111 111")).toBe(1);
    expect(calculateCheckDigit("4111-1111-1111-111")).toBe(1);
  });

  // Test error handling
  it("should throw error for invalid input", () => {
    expect(() => calculateCheckDigit("41111111X111111")).toThrow();
    expect(() => calculateCheckDigit("")).toThrow();
  });
});

/**
 * Tests for Credit Card Generator
 */

import { describe, it, expect } from "vitest";
import { validateLuhn } from "../js/luhn.js";
import {
  generateCardNumber,
  generateCustomCardNumber,
  getRandomPrefix,
  getRandomInt,
  ERROR_MESSAGES,
} from "../js/generator.js";
import { CARD_TYPES } from "../js/cardTypes.js";

describe("getRandomInt", () => {
  it("should generate random integers within the specified range", () => {
    // Test with a small range to ensure we can verify the result
    const min = 1;
    const max = 5;
    const result = getRandomInt(min, max);

    expect(result).toBeGreaterThanOrEqual(min);
    expect(result).toBeLessThanOrEqual(max);
    expect(Number.isInteger(result)).toBe(true);
  });

  it("should handle min equal to max", () => {
    const result = getRandomInt(10, 10);
    expect(result).toBe(10);
  });

  it("should throw error for invalid range", () => {
    expect(() => getRandomInt(10, 5)).toThrow(ERROR_MESSAGES.INVALID_MIN_MAX);
    expect(() => getRandomInt("a", 5)).toThrow(ERROR_MESSAGES.INVALID_RANGE);
    expect(() => getRandomInt(5, "b")).toThrow(ERROR_MESSAGES.INVALID_RANGE);
  });
});

describe("getRandomPrefix", () => {
  it("should return valid prefixes for different card types", () => {
    // Visa
    const visaPrefix = getRandomPrefix(CARD_TYPES.VISA);
    expect(visaPrefix).toBe("4");

    // Mastercard
    const mcPrefix = getRandomPrefix(CARD_TYPES.MASTERCARD);
    const mcPrefixNum = parseInt(mcPrefix, 10);
    const isMcValid =
      (mcPrefixNum >= 51 && mcPrefixNum <= 55) ||
      (mcPrefixNum >= 2221 && mcPrefixNum <= 2720);
    expect(isMcValid).toBe(true);

    // Amex
    const amexPrefix = getRandomPrefix(CARD_TYPES.AMEX);
    expect(["34", "37"]).toContain(amexPrefix);

    // Discover
    const discoverPrefix = getRandomPrefix(CARD_TYPES.DISCOVER);
    const discoverPrefixNum = parseInt(discoverPrefix, 10);
    const isDiscoverValid =
      discoverPrefix === "6011" ||
      (discoverPrefixNum >= 644 && discoverPrefixNum <= 649) ||
      discoverPrefix === "65";
    expect(isDiscoverValid).toBe(true);
  });

  it("should throw error for invalid card type", () => {
    expect(() => getRandomPrefix("invalid_type")).toThrow();
    expect(() => getRandomPrefix(null)).toThrow();
    expect(() => getRandomPrefix(undefined)).toThrow();
  });
});

describe("generateCardNumber", () => {
  it("should generate valid card numbers for all supported types", () => {
    // Test all card types
    const cardTypes = Object.values(CARD_TYPES);

    for (const cardType of cardTypes) {
      const card = generateCardNumber(cardType);

      // Verify card number format based on type
      switch (cardType) {
        case CARD_TYPES.VISA:
          expect(card).toMatch(/^4\d{15}$/);
          break;
        case CARD_TYPES.MASTERCARD:
          expect(card).toMatch(
            /^(5[1-5]|222[1-9]|22[3-9]\d|2[3-6]\d\d|27[0-1]\d|2720)\d{10,14}$/,
          );
          break;
        case CARD_TYPES.AMEX:
          expect(card).toMatch(/^3[47]\d{13}$/);
          break;
        case CARD_TYPES.DISCOVER:
          expect(card).toMatch(/^(6011|6[4-5])\d{12,14}$/);
          break;
      }

      // All generated cards should pass Luhn validation
      expect(validateLuhn(card)).toBe(true);
    }
  });

  it("should throw error for invalid inputs", () => {
    expect(() => generateCardNumber("invalid_type")).toThrow();
    expect(() =>
      generateCardNumber(null, { prefix: "abc", length: 16 }),
    ).toThrow();
    expect(() =>
      generateCardNumber(null, { prefix: "123", length: 5 }),
    ).toThrow();
  });
});

describe("generateCustomCardNumber", () => {
  it("should generate valid numbers with prefix/length format", () => {
    const cardNumber = generateCustomCardNumber("123/16");
    expect(cardNumber).toMatch(/^123\d{13}$/);
    expect(validateLuhn(cardNumber)).toBe(true);
  });

  it("should handle different prefix lengths", () => {
    const cardNumber1 = generateCustomCardNumber("1/16");
    const cardNumber2 = generateCustomCardNumber("12345/16");

    expect(cardNumber1).toMatch(/^1\d{15}$/);
    expect(validateLuhn(cardNumber1)).toBe(true);

    expect(cardNumber2).toMatch(/^12345\d{11}$/);
    expect(validateLuhn(cardNumber2)).toBe(true);
  });

  it("should return valid exact numbers unchanged", () => {
    // A valid 16-digit card number that passes Luhn check
    const validExactNumber = "4532015112830366";
    const cardNumber = generateCustomCardNumber(validExactNumber);

    expect(cardNumber).toBe(validExactNumber);
    expect(validateLuhn(cardNumber)).toBe(true);
  });

  it("should handle length boundaries (10-19 digits)", () => {
    const cardNumber1 = generateCustomCardNumber("123/10");
    const cardNumber2 = generateCustomCardNumber("123/19");

    expect(cardNumber1).toMatch(/^123\d{7}$/);
    expect(validateLuhn(cardNumber1)).toBe(true);
    expect(cardNumber1.length).toBe(10);

    expect(cardNumber2).toMatch(/^123\d{16}$/);
    expect(validateLuhn(cardNumber2)).toBe(true);
    expect(cardNumber2.length).toBe(19);
  });

  it("should throw error for invalid mask format", () => {
    expect(() => generateCustomCardNumber("abc/16")).toThrow();
    expect(() => generateCustomCardNumber("")).toThrow();
    expect(() => generateCustomCardNumber("123/9")).toThrow();
  });

  it("should throw error for invalid exact number that fails Luhn check", () => {
    // A 16-digit number that fails Luhn check
    const invalidExactNumber = "4532015112830367"; // Changed last digit
    expect(() => generateCustomCardNumber(invalidExactNumber)).toThrow();
  });
});

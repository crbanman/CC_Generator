/**
 * Tests for Credit Card Type Definitions
 */

import { describe, it, expect } from "vitest";
import {
  CARD_TYPES,
  getCardTypeInfo,
  matchesCardType,
  identifyCardType,
} from "../js/cardTypes.js";

describe("Card Type Definitions", () => {
  it("should have defined card type constants", () => {
    expect(CARD_TYPES.VISA).toBe("visa");
    expect(CARD_TYPES.MASTERCARD).toBe("mastercard");
    expect(CARD_TYPES.AMEX).toBe("amex");
    expect(CARD_TYPES.DISCOVER).toBe("discover");
  });
});

describe("getCardTypeInfo", () => {
  it("should return correct info for card types", () => {
    // Visa
    const visaInfo = getCardTypeInfo(CARD_TYPES.VISA);
    expect(visaInfo.prefixes).toEqual([{ start: 4, end: 4 }]);
    expect(visaInfo.length).toBe(16);

    // Mastercard
    const mcInfo = getCardTypeInfo(CARD_TYPES.MASTERCARD);
    expect(mcInfo.prefixes).toEqual([
      { start: 51, end: 55 },
      { start: 2221, end: 2720 },
    ]);
    expect(mcInfo.length).toBe(16);

    // Amex
    const amexInfo = getCardTypeInfo(CARD_TYPES.AMEX);
    expect(amexInfo.prefixes).toEqual([
      { start: 34, end: 34 },
      { start: 37, end: 37 },
    ]);
    expect(amexInfo.length).toBe(15);

    // Discover
    const discoverInfo = getCardTypeInfo(CARD_TYPES.DISCOVER);
    expect(discoverInfo.prefixes).toEqual([
      { start: 6011, end: 6011 },
      { start: 644, end: 649 },
      { start: 65, end: 65 },
    ]);
    expect(discoverInfo.length).toBe(16);
  });

  it("should throw error for invalid card type", () => {
    expect(() => getCardTypeInfo("invalid_type")).toThrow();
  });
});

describe("matchesCardType", () => {
  it("should match valid card numbers to their types", () => {
    // Visa
    expect(matchesCardType("4532015112830366", CARD_TYPES.VISA)).toBe(true);

    // Mastercard ranges
    expect(matchesCardType("5555555555554444", CARD_TYPES.MASTERCARD)).toBe(
      true,
    );
    expect(matchesCardType("2221000000000009", CARD_TYPES.MASTERCARD)).toBe(
      true,
    );

    // Amex ranges
    expect(matchesCardType("343452111111111", CARD_TYPES.AMEX)).toBe(true);
    expect(matchesCardType("378282246310005", CARD_TYPES.AMEX)).toBe(true);

    // Discover ranges
    expect(matchesCardType("6011111111111117", CARD_TYPES.DISCOVER)).toBe(true);
    expect(matchesCardType("6444444444444444", CARD_TYPES.DISCOVER)).toBe(true);
    expect(matchesCardType("6534567890123452", CARD_TYPES.DISCOVER)).toBe(true);
  });

  it("should not match invalid card numbers", () => {
    // Wrong length
    expect(matchesCardType("411111111111111", CARD_TYPES.VISA)).toBe(false);

    // Wrong prefix
    expect(matchesCardType("1234567890123456", CARD_TYPES.VISA)).toBe(false);
  });
});

describe("identifyCardType", () => {
  it("should correctly identify card types from numbers", () => {
    expect(identifyCardType("4532015112830366")).toBe(CARD_TYPES.VISA);
    expect(identifyCardType("5555555555554444")).toBe(CARD_TYPES.MASTERCARD);
    expect(identifyCardType("2221000000000009")).toBe(CARD_TYPES.MASTERCARD);
    expect(identifyCardType("378282246310005")).toBe(CARD_TYPES.AMEX);
    expect(identifyCardType("6011111111111117")).toBe(CARD_TYPES.DISCOVER);
  });

  it("should return null for unrecognized card", () => {
    expect(identifyCardType("1234567890123456")).toBe(null);
  });

  it("should handle formatting characters in card number", () => {
    expect(identifyCardType("4532 0151 1283 0366")).toBe(CARD_TYPES.VISA);
    expect(identifyCardType("4532-0151-1283-0366")).toBe(CARD_TYPES.VISA);
  });
});

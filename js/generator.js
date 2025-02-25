/**
 * Credit Card Number Generator
 *
 * This module provides functions for generating valid credit card numbers
 * for different card types using the Luhn algorithm.
 */

import { CARD_TYPES, getCardTypeInfo } from "./cardTypes.js";
import { calculateCheckDigit, validateLuhn } from "./luhn.js";
import { parseCustomMask } from "./customMask.js";

const ERROR_MESSAGES = {
  INVALID_CARD_TYPE: "Unsupported card type",
  GENERATION_FAILED: "Failed to generate card number",
  CUSTOM_GENERATION_FAILED: "Failed to generate custom card number",
  INVALID_MIN_MAX: "Min value must be less than or equal to max value",
  INVALID_RANGE: "Values must be valid integers",
  LUHN_VALIDATION_FAILED: "Card number fails Luhn validation",
};

/**
 * Generates a random integer between min and max (inclusive)
 *
 * @param {number} min - The minimum value
 * @param {number} max - The maximum value
 * @returns {number} - A random integer between min and max
 * @throws {Error} - If min > max or inputs are not valid numbers
 */
function getRandomInt(min, max) {
  if (typeof min !== "number" || typeof max !== "number") {
    throw new Error(ERROR_MESSAGES.INVALID_RANGE);
  }

  min = Math.ceil(min);
  max = Math.floor(max);

  if (min > max) {
    throw new Error(ERROR_MESSAGES.INVALID_MIN_MAX);
  }

  return Math.floor(Math.random() * (max - min + 1)) + min;
}

/**
 * Selects a random prefix for the given card type
 *
 * @param {string} cardType - The type of card (use CARD_TYPES constants)
 * @returns {string} - A valid prefix for the card type
 * @throws {Error} - If the card type is invalid or not found
 */
function getRandomPrefix(cardType) {
  if (!cardType || typeof cardType !== "string") {
    throw new Error(
      `${ERROR_MESSAGES.INVALID_CARD_TYPE}: Card type must be a non-empty string`,
    );
  }

  try {
    const cardInfo = getCardTypeInfo(cardType);

    if (
      !cardInfo ||
      !cardInfo.prefixes ||
      !Array.isArray(cardInfo.prefixes) ||
      cardInfo.prefixes.length === 0
    ) {
      throw new Error(`No valid prefixes found for card type: ${cardType}`);
    }

    const prefixObj =
      cardInfo.prefixes[getRandomInt(0, cardInfo.prefixes.length - 1)];

    const prefix = getRandomInt(prefixObj.start, prefixObj.end);
    return prefix.toString();
  } catch (error) {
    throw new Error(`Failed to get random prefix: ${error.message}`);
  }
}

/**
 * Generates a valid credit card number for the specified card type
 *
 * @param {string} cardType - The type of card to generate (use CARD_TYPES constants)
 * @returns {string} - A valid credit card number for the specified type
 * @throws {Error} - If the card type is not supported or generation fails
 */
function generateCardNumber(cardType) {
  if (!cardType || typeof cardType !== "string") {
    throw new Error(
      `${ERROR_MESSAGES.INVALID_CARD_TYPE}: Card type must be a non-empty string`,
    );
  }

  if (!Object.values(CARD_TYPES).includes(cardType)) {
    throw new Error(
      `${
        ERROR_MESSAGES.INVALID_CARD_TYPE
      }: ${cardType}. Valid types are: ${Object.values(CARD_TYPES).join(", ")}`,
    );
  }

  try {
    const cardInfo = getCardTypeInfo(cardType);

    if (!cardInfo) {
      throw new Error(`Card type information not found for: ${cardType}`);
    }

    if (!cardInfo.length || typeof cardInfo.length !== "number") {
      throw new Error(`Invalid length for card type: ${cardType}`);
    }

    const prefix = getRandomPrefix(cardType);

    const randomDigitsCount = cardInfo.length - prefix.length - 1;

    if (randomDigitsCount < 0) {
      throw new Error(
        `Invalid configuration: prefix length (${prefix.length}) exceeds card length (${cardInfo.length})`,
      );
    }

    let partialNumber = prefix;
    for (let i = 0; i < randomDigitsCount; i++) {
      partialNumber += getRandomInt(0, 9);
    }

    const checkDigit = calculateCheckDigit(partialNumber);

    return partialNumber + checkDigit;
  } catch (error) {
    throw new Error(`${ERROR_MESSAGES.GENERATION_FAILED}: ${error.message}`);
  }
}

/**
 * Generates a valid credit card number based on a custom mask
 *
 * @param {string} mask - The mask string to parse (e.g., "123/15" or "1234567890123456")
 * @returns {string} - A valid credit card number matching the mask
 * @throws {Error} - If the mask format is invalid or validation fails
 */
function generateCustomCardNumber(mask) {
  if (!mask || typeof mask !== "string") {
    throw new Error(
      `${ERROR_MESSAGES.CUSTOM_GENERATION_FAILED}: Mask must be a non-empty string`,
    );
  }

  try {
    const maskInfo = parseCustomMask(mask);

    if (maskInfo.isExact) {
      if (!validateLuhn(maskInfo.prefix)) {
        throw new Error(ERROR_MESSAGES.LUHN_VALIDATION_FAILED);
      }
      return maskInfo.prefix;
    }

    const prefix = maskInfo.prefix;

    const randomDigitsCount = maskInfo.length - prefix.length - 1;

    if (randomDigitsCount < 0) {
      throw new Error(
        `Invalid configuration: prefix length (${prefix.length}) exceeds card length (${maskInfo.length})`,
      );
    }

    let partialNumber = prefix;
    for (let i = 0; i < randomDigitsCount; i++) {
      partialNumber += getRandomInt(0, 9);
    }

    const checkDigit = calculateCheckDigit(partialNumber);

    return partialNumber + checkDigit;
  } catch (error) {
    throw new Error(
      `${ERROR_MESSAGES.CUSTOM_GENERATION_FAILED}: ${error.message}`,
    );
  }
}

export {
  generateCardNumber,
  generateCustomCardNumber,
  getRandomPrefix,
  getRandomInt,
  ERROR_MESSAGES,
};

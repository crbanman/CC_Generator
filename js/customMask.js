/**
 * Custom Mask Parser for Credit Card Numbers
 *
 * This module provides functionality to parse user-defined credit card number formats
 * such as "123/15" (a 15-digit number starting with 123) or exact numbers like "1234567890".
 */

/**
 * Validates that a string contains only digits
 *
 * @param {string} str - The string to validate
 * @param {string} fieldName - Name of the field for error message
 * @returns {boolean} - True if valid
 * @throws {Error} - If the string contains non-digit characters
 */
function validateDigitsOnly(str, fieldName) {
  if (!/^\d+$/.test(str)) {
    throw new Error(`${fieldName} must contain only digits`);
  }
  return true;
}

/**
 * Parses a user-defined credit card mask format
 *
 * @param {string} mask - The mask string to parse (e.g., "123/15" or "1234567890123456")
 * @returns {Object} - An object with { prefix, length, isExact } properties
 * @throws {Error} - If the mask format is invalid
 */
function parseCustomMask(mask) {
  if (mask === undefined || mask === null) {
    throw new Error("Mask cannot be null or undefined");
  }

  if (typeof mask !== "string") {
    throw new Error("Mask must be a string");
  }

  const trimmedMask = mask.trim();

  if (trimmedMask.length === 0) {
    throw new Error("Mask cannot be empty");
  }

  if (/[^\d\/]/.test(trimmedMask)) {
    throw new Error("Mask can only contain digits and the '/' character");
  }

  if (/^\d+$/.test(trimmedMask)) {
    if (trimmedMask.length < 10) {
      throw new Error(
        `Exact card number is too short (${trimmedMask.length} digits). Must be at least 10 digits.`,
      );
    }

    if (trimmedMask.length > 19) {
      throw new Error(
        `Exact card number is too long (${trimmedMask.length} digits). Must be at most 19 digits.`,
      );
    }

    return {
      prefix: trimmedMask,
      length: trimmedMask.length,
      isExact: true,
    };
  }

  const formatRegex = /^(\d+)\/(\d+)$/;
  const match = trimmedMask.match(formatRegex);

  if (!match) {
    throw new Error(
      'Invalid mask format. Use "prefix/length" (e.g., "123/15") or an exact number',
    );
  }

  const prefix = match[1];
  const lengthStr = match[2];

  if (prefix.length === 0) {
    throw new Error("Prefix cannot be empty");
  }

  validateDigitsOnly(prefix, "Prefix");

  validateDigitsOnly(lengthStr, "Length");
  const length = parseInt(lengthStr, 10);

  if (isNaN(length)) {
    throw new Error("Length must be a valid number");
  }

  if (prefix.length >= length) {
    throw new Error(
      `Prefix length (${prefix.length}) must be less than the total card length (${length})`,
    );
  }

  if (length < 10) {
    throw new Error(
      `Card length (${length}) is too short. Must be at least 10 digits.`,
    );
  }

  if (length > 19) {
    throw new Error(
      `Card length (${length}) is too long. Must be at most 19 digits.`,
    );
  }

  return {
    prefix,
    length,
    isExact: false,
  };
}

export { parseCustomMask, validateDigitsOnly };

/**
 * Luhn Algorithm Implementation
 *
 * This module provides functions for working with the Luhn algorithm,
 * which is used to validate credit card numbers.
 */

/**
 * Validates if a number passes the Luhn check
 *
 * @param {string|number} number - The credit card number to validate
 * @returns {boolean} - True if the number passes the Luhn check, false otherwise
 * @throws {Error} - If the input is not a valid number string
 */
function validateLuhn(number) {
  const digits = String(number).replace(/[\s-]/g, "");

  if (!/^\d+$/.test(digits)) {
    throw new Error("Input must contain only digits, spaces, or dashes");
  }

  let sum = 0;
  let double = false;

  for (let i = digits.length - 1; i >= 0; i--) {
    let digit = parseInt(digits.charAt(i), 10);

    if (double) {
      digit *= 2;
      if (digit > 9) {
        digit -= 9;
      }
    }

    sum += digit;
    double = !double;
  }

  return sum % 10 === 0;
}

/**
 * Calculates the check digit for a partial credit card number
 *
 * @param {string|number} partialNumber - The partial number without the check digit
 * @returns {number} - The check digit (0-9)
 * @throws {Error} - If the input is not a valid number string
 */
function calculateCheckDigit(partialNumber) {
  const digits = String(partialNumber).replace(/[\s-]/g, "");

  if (!/^\d+$/.test(digits)) {
    throw new Error("Input must contain only digits, spaces, or dashes");
  }

  const tempNumber = digits + "0";

  let sum = 0;
  let double = false;

  for (let i = tempNumber.length - 1; i >= 0; i--) {
    let digit = parseInt(tempNumber.charAt(i), 10);

    if (double) {
      digit *= 2;
      if (digit > 9) {
        digit -= 9;
      }
    }

    sum += digit;
    double = !double;
  }

  return (10 - (sum % 10)) % 10;
}

export { calculateCheckDigit, validateLuhn };

import { IIssuer } from "../../interfaces/IIssuer";

/**
 * Generate a Luhn number with the given prefix and number of digits.
 *
 * If the given prefix is longer than the number of digits, the prefix will
 * be truncated.
 *
 * @param prefix The card's number prefix.
 * @param numDigits The total number of digits the cc number will be.
 */
export function generateLuhnNumber(prefix: number, numDigits: number): string {
  let digits = Array.from(String(prefix), Number);

  if (digits.length >= numDigits) {
    digits = digits.slice(0, numDigits - 1);
  }

  for (let i = digits.length; i < numDigits - 1; i++) {
    digits[i] = Math.floor(Math.random() * (9 + 1));
  }

  digits[numDigits - 1] = getCheckDigit(digits);
  return digits.join("");
}

/**
 * Gets the check digit to go at the end of a Luhn number.
 *
 * @param digits An array of digits that will make up the number.
 */
export function getCheckDigit(digits: number[]): number {
  let sum = 0;
  let count = 1;
  for (let i = digits.length - 1; i >= 0; i--) {
    if (count % 2 != 0) {
      let num = digits[i] * 2;
      if (num >= 10) {
        num -= 9;
      }
      sum += num;
    } else {
      sum += digits[i];
    }
    count++;
  }
  return (-(sum % 10) + 10) % 10;
}

/**
 * Generate a credit card number for a given issue.
 * 
 * @param issuer The credit card issue.
 */
export function generateCardNumber(issuer: IIssuer): string {
  return generateLuhnNumber(issuer.prefix, issuer.numDigits);
}

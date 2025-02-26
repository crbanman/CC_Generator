/**
 * Credit Card Type Definitions
 *
 * This module defines the supported credit card types with their
 * prefix patterns and length requirements.
 */

const CARD_TYPES = {
  VISA: "visa",
  MASTERCARD: "mastercard",
  AMEX: "amex",
  DISCOVER: "discover",
};

const CARD_TYPE_INFO = {
  [CARD_TYPES.VISA]: {
    name: "Visa",
    prefixes: [{ start: 4, end: 4 }],
    length: 16,
  },
  [CARD_TYPES.MASTERCARD]: {
    name: "Mastercard",
    prefixes: [
      { start: 51, end: 55 },
      { start: 2221, end: 2720 },
    ],
    length: 16,
  },
  [CARD_TYPES.AMEX]: {
    name: "American Express",
    prefixes: [
      { start: 34, end: 34 },
      { start: 37, end: 37 },
    ],
    length: 15,
  },
  [CARD_TYPES.DISCOVER]: {
    name: "Discover",
    prefixes: [
      { start: 6011, end: 6011 },
      { start: 644, end: 649 },
      { start: 65, end: 65 },
    ],
    length: 16,
  },
};

/**
 * Returns the prefix patterns and length requirement for a given card type
 *
 * @param {string} cardType - The type of card (use CARD_TYPES constants)
 * @returns {Object} Object containing prefixes and length for the card type
 * @throws {Error} If the card type is not supported
 */
function getCardTypeInfo(cardType) {
  if (!CARD_TYPE_INFO[cardType]) {
    throw new Error(`Unsupported card type: ${cardType}`);
  }

  return CARD_TYPE_INFO[cardType];
}

/**
 * Determines if a card number matches a specific card type
 *
 * @param {string} cardNumber - The card number to check
 * @param {string} cardType - The type of card to check against
 * @returns {boolean} True if the card number matches the card type
 * @throws {Error} If the card type is not supported
 */
function matchesCardType(cardNumber, cardType) {
  const cleanCardNumber = cardNumber.replace(/[\s-]/g, "");

  const cardInfo = getCardTypeInfo(cardType);

  if (cleanCardNumber.length !== cardInfo.length) {
    return false;
  }

  return cardInfo.prefixes.some((prefix) => {
    const prefixLength = String(prefix.start).length;
    const cardPrefix = parseInt(cleanCardNumber.substring(0, prefixLength), 10);
    return cardPrefix >= prefix.start && cardPrefix <= prefix.end;
  });
}

/**
 * Identifies the card type based on the card number
 *
 * @param {string} cardNumber - The card number to identify
 * @returns {string|null} The identified card type or null if no match
 */
function identifyCardType(cardNumber) {
  const cleanCardNumber = cardNumber.replace(/[\s-]/g, "");

  for (const cardType in CARD_TYPE_INFO) {
    if (matchesCardType(cleanCardNumber, cardType)) {
      return cardType;
    }
  }

  return null;
}

export { CARD_TYPES, getCardTypeInfo, matchesCardType, identifyCardType };

/**
 * Storage Utilities for Credit Card Generator
 *
 * This module provides functions for interacting with Chrome's storage API,
 * including saving and retrieving settings, history, and custom masks.
 */

import { parseCustomMask } from "./customMask.js";

const DEFAULT_SETTINGS = {
  generateOnOpen: true,
  theme: "light",
  enableCustomMasks: false,
  customMasks: [],
  lastGeneratedNumber: null,
};

const MAX_HISTORY_ITEMS = 50;

const ERROR_MESSAGES = {
  LOAD_SETTINGS: "Failed to load settings from storage",
  SAVE_SETTINGS: "Failed to save settings to storage",
  ADD_HISTORY: "Failed to add item to history",
  GET_HISTORY: "Failed to retrieve history from storage",
  CLEAR_HISTORY: "Failed to clear history",
  RESET_SETTINGS: "Failed to reset settings to defaults",
  VALIDATE_MASKS: "Failed to validate custom masks",
};

/**
 * Validates settings object structure
 *
 * @param {Object} settings - The settings object to validate
 * @returns {Object} - Object with validation result and any errors
 */
function validateSettings(settings) {
  const errors = [];

  if (!settings || typeof settings !== "object") {
    return {
      isValid: false,
      errors: ["Settings must be a valid object"],
    };
  }

  if (
    settings.hasOwnProperty("generateOnOpen") &&
    typeof settings.generateOnOpen !== "boolean"
  ) {
    errors.push("Generate on open setting must be a boolean value");
  }

  if (settings.hasOwnProperty("theme") && typeof settings.theme !== "string") {
    errors.push("Theme setting must be a string value");
  }

  if (
    settings.hasOwnProperty("enableCustomMasks") &&
    typeof settings.enableCustomMasks !== "boolean"
  ) {
    errors.push("Enable custom masks setting must be a boolean value");
  }

  if (settings.hasOwnProperty("customMasks")) {
    if (!Array.isArray(settings.customMasks)) {
      errors.push("Custom masks must be an array");
    } else {
      settings.customMasks.forEach((mask, index) => {
        if (typeof mask !== "string") {
          errors.push(`Custom mask at position ${index + 1} must be a string`);
        }
      });
    }
  }

  if (
    settings.hasOwnProperty("lastGeneratedNumber") &&
    settings.lastGeneratedNumber !== null &&
    typeof settings.lastGeneratedNumber !== "string"
  ) {
    errors.push("Last generated number must be a string or null");
  }

  return {
    isValid: errors.length === 0,
    errors,
  };
}

/**
 * Loads settings from Chrome storage with defaults for missing values
 *
 * @returns {Promise<Object>} - Promise resolving to the settings object
 * @throws {Error} - If there's an error loading settings
 */
async function loadSettings() {
  try {
    const settings = await chrome.storage.sync.get(null);

    return {
      ...DEFAULT_SETTINGS,
      ...settings,
    };
  } catch (error) {
    console.error(ERROR_MESSAGES.LOAD_SETTINGS, error);
    throw new Error(`${ERROR_MESSAGES.LOAD_SETTINGS}: ${error.message}`);
  }
}

/**
 * Saves settings to Chrome storage
 *
 * @param {Object} settings - The settings object to save
 * @returns {Promise<void>} - Promise resolving when settings are saved
 * @throws {Error} - If there's an error saving settings or validation fails
 */
async function saveSettings(settings) {
  try {
    const validation = validateSettings(settings);
    if (!validation.isValid) {
      throw new Error(`Invalid settings: ${validation.errors.join(", ")}`);
    }

    await chrome.storage.sync.set(settings);
    return { success: true };
  } catch (error) {
    console.error(ERROR_MESSAGES.SAVE_SETTINGS, error);
    throw new Error(`${ERROR_MESSAGES.SAVE_SETTINGS}: ${error.message}`);
  }
}

/**
 * Adds a card number to the history
 *
 * @param {string} cardNumber - The card number to add
 * @param {string} cardType - The type of card (optional)
 * @returns {Promise<Object>} - Promise resolving with success status
 */
async function addToHistory(cardNumber, cardType = "Unknown") {
  try {
    if (!cardNumber || typeof cardNumber !== "string") {
      throw new Error("Card number must be a non-empty string");
    }

    if (!/^\d+$/.test(cardNumber)) {
      throw new Error("Card number must contain only digits");
    }

    const { history = [] } = await chrome.storage.local.get("history");

    const historyItem = {
      number: cardNumber,
      type: cardType,
      timestamp: new Date().toISOString(),
    };

    const newHistory = [historyItem, ...history];

    if (newHistory.length > MAX_HISTORY_ITEMS) {
      newHistory.length = MAX_HISTORY_ITEMS;
    }

    await chrome.storage.local.set({ history: newHistory });
    return { success: true };
  } catch (error) {
    console.error(ERROR_MESSAGES.ADD_HISTORY, error);
    return {
      success: false,
      error: `${ERROR_MESSAGES.ADD_HISTORY}: ${error.message}`,
    };
  }
}

/**
 * Gets the history of generated card numbers
 *
 * @returns {Promise<Object>} - Promise resolving to object with history array and success status
 */
async function getHistory() {
  try {
    const { history = [] } = await chrome.storage.local.get("history");
    return {
      success: true,
      history,
    };
  } catch (error) {
    console.error(ERROR_MESSAGES.GET_HISTORY, error);
    return {
      success: false,
      history: [],
      error: `${ERROR_MESSAGES.GET_HISTORY}: ${error.message}`,
    };
  }
}

/**
 * Clears the history
 *
 * @returns {Promise<Object>} - Promise resolving with success status
 * @throws {Error} - If there's an error clearing history
 */
async function clearHistory() {
  try {
    await chrome.storage.local.set({ history: [] });
    return { success: true };
  } catch (error) {
    console.error(ERROR_MESSAGES.CLEAR_HISTORY, error);
    throw new Error(`${ERROR_MESSAGES.CLEAR_HISTORY}: ${error.message}`);
  }
}

/**
 * Resets settings to defaults (without affecting history)
 *
 * @returns {Promise<Object>} - Promise resolving with success status
 * @throws {Error} - If there's an error resetting settings
 */
async function resetSettings() {
  try {
    await chrome.storage.sync.set(DEFAULT_SETTINGS);
    return { success: true };
  } catch (error) {
    console.error(ERROR_MESSAGES.RESET_SETTINGS, error);
    throw new Error(`${ERROR_MESSAGES.RESET_SETTINGS}: ${error.message}`);
  }
}

/**
 * Gets parsed custom masks from settings
 *
 * @returns {Promise<Object>} - Promise resolving to object with parsed masks and success status
 */
async function getParsedCustomMasks() {
  try {
    const settings = await loadSettings();

    if (
      !settings.enableCustomMasks ||
      !settings.customMasks ||
      settings.customMasks.length === 0
    ) {
      return {
        success: true,
        masks: [],
      };
    }

    const parsedMasks = [];
    const errors = [];

    for (const [index, mask] of settings.customMasks.entries()) {
      try {
        const parsedMask = parseCustomMask(mask);
        parsedMasks.push(parsedMask);
      } catch (error) {
        errors.push({
          index,
          mask,
          error: error.message,
        });
      }
    }

    return {
      success: true,
      masks: parsedMasks,
      errors: errors.length > 0 ? errors : null,
    };
  } catch (error) {
    console.error("Error getting parsed custom masks:", error);
    return {
      success: false,
      masks: [],
      error: `Failed to parse custom masks: ${error.message}`,
    };
  }
}

/**
 * Checks if there are valid custom masks available
 *
 * @returns {Promise<boolean>} - Promise resolving to true if valid custom masks exist
 */
async function hasValidCustomMasks() {
  const result = await getParsedCustomMasks();
  return result.success && result.masks.length > 0;
}

/**
 * Validates custom masks from settings
 *
 * @returns {Promise<{isValid: boolean, errors: Array}>} - Promise resolving to validation result
 */
async function validateCustomMasks() {
  try {
    const settings = await loadSettings();

    if (!settings.enableCustomMasks) {
      return { isValid: true, errors: [] };
    }

    if (!settings.customMasks || settings.customMasks.length === 0) {
      return { isValid: true, errors: [] };
    }

    const errors = [];
    settings.customMasks.forEach((mask, index) => {
      try {
        parseCustomMask(mask);
      } catch (error) {
        errors.push({
          line: index + 1,
          text: mask,
          error: error.message,
        });
      }
    });

    return {
      isValid: errors.length === 0,
      errors,
    };
  } catch (error) {
    console.error(ERROR_MESSAGES.VALIDATE_MASKS, error);
    return {
      isValid: false,
      errors: [{ error: `${ERROR_MESSAGES.VALIDATE_MASKS}: ${error.message}` }],
    };
  }
}

export {
  loadSettings,
  saveSettings,
  addToHistory,
  getHistory,
  clearHistory,
  resetSettings,
  getParsedCustomMasks,
  hasValidCustomMasks,
  validateCustomMasks,
  validateSettings,
  DEFAULT_SETTINGS,
  MAX_HISTORY_ITEMS,
  ERROR_MESSAGES,
};

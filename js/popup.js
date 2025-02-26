/**
 * Popup script for the CC Generator extension
 *
 * This script handles the UI initialization, card number generation,
 * clipboard functionality, and error handling.
 */

import { CARD_TYPES, getCardTypeInfo } from "./cardTypes.js";
import { generateCardNumber, generateCustomCardNumber } from "./generator.js";
import { initTheme } from "./theme.js";
import {
  getParsedCustomMasks,
  hasValidCustomMasks,
  addToHistory,
  getHistory,
} from "./storage.js";

const CUSTOM_CARD_TYPE = "custom";

const UI_ERROR_MESSAGES = {
  COPY_FAILED: "Failed to copy to clipboard",
  GENERATION_FAILED: "Failed to generate card number",
  NO_VALID_MASKS: "No valid custom masks available",
  CLIPBOARD_PERMISSION: "Permission to write to clipboard denied",
};

document.addEventListener("DOMContentLoaded", function () {
  const cardTypeSelect = document.getElementById("card-type");
  const ccNumberElement = document.getElementById("cc-number");
  const generateBtn = document.getElementById("generate-btn");
  const copyTooltip = document.getElementById("copy-tooltip");
  const settingsLink = document.getElementById("settings-link");
  const errorContainer =
    document.getElementById("error-container") || createErrorContainer();

  let tooltipTimeout;

  /**
   * Creates an error container if it doesn't exist
   * @returns {HTMLElement} - The error container element
   */
  function createErrorContainer() {
    const container = document.createElement("div");
    container.id = "error-container";
    container.className = "error-container hidden";
    container.setAttribute("role", "alert");
    container.setAttribute("aria-hidden", "true");
    document.body.appendChild(container);
    return container;
  }

  /**
   * Shows an error message in the UI
   * @param {string} message - The error message to display
   * @param {number} [duration=3000] - How long to show the message in milliseconds
   */
  function showError(message, duration = 3000) {
    errorContainer.textContent = message;
    errorContainer.classList.remove("hidden");
    errorContainer.setAttribute("aria-hidden", "false");

    setTimeout(() => {
      errorContainer.classList.add("hidden");
      errorContainer.setAttribute("aria-hidden", "true");
    }, duration);
  }

  /**
   * Formats a credit card number with spaces
   * @param {string} number - The credit card number to format
   * @returns {string} - The formatted credit card number
   */
  function formatCardNumber(number) {
    if (!number || typeof number !== "string") {
      return "";
    }

    const cardType = cardTypeSelect.value;

    if (cardType === CARD_TYPES.AMEX) {
      // AMEX format: XXXX XXXXXX XXXXX
      return number.replace(/(\d{4})(\d{6})(\d{5})/, "$1 $2 $3");
    } else {
      // Default format: XXXX XXXX XXXX XXXX
      return number.replace(/(\d{4})(?=\d)/g, "$1 ");
    }
  }

  /**
   * Generates and displays a new card number
   * @returns {Promise<void>}
   */
  async function generateNewCardNumber() {
    const cardType = cardTypeSelect.value;
    let cardNumber;

    try {
      if (cardType === CUSTOM_CARD_TYPE) {
        const masksResult = await getParsedCustomMasks();

        if (!masksResult.success) {
          throw new Error(
            masksResult.error || UI_ERROR_MESSAGES.GENERATION_FAILED,
          );
        }

        const masks = masksResult.masks;

        if (masks.length === 0) {
          ccNumberElement.textContent = UI_ERROR_MESSAGES.NO_VALID_MASKS;
          showError(UI_ERROR_MESSAGES.NO_VALID_MASKS);
          return;
        }

        const randomMask = masks[Math.floor(Math.random() * masks.length)];

        if (randomMask.isExact) {
          cardNumber = randomMask.prefix;
        } else {
          const maskString = `${randomMask.prefix}/${randomMask.length}`;
          cardNumber = generateCustomCardNumber(maskString);
        }
      } else {
        cardNumber = generateCardNumber(cardType);
      }

      ccNumberElement.textContent = formatCardNumber(cardNumber);

      if (cardType === CUSTOM_CARD_TYPE) {
        await addToHistory(cardNumber, "Custom");
      } else {
        const cardInfo = getCardTypeInfo(cardType);
        const displayName = cardInfo ? cardInfo.name : cardType;
        await addToHistory(cardNumber, displayName);
      }

      chrome.storage.sync.set({
        cardType,
        lastGeneratedNumber: cardNumber,
      });

      ccNumberElement.parentElement.classList.remove("disabled");
    } catch (error) {
      console.error("Error generating card number:", error);
      ccNumberElement.textContent = "Generation failed";
      showError(error.message || UI_ERROR_MESSAGES.GENERATION_FAILED);

      ccNumberElement.parentElement.classList.add("disabled");
    }
  }

  /**
   * Shows the copy tooltip
   * @param {boolean} [success=true] - Whether the copy was successful
   */
  function showCopyTooltip(success = true) {
    // Clear any existing timeout
    if (tooltipTimeout) {
      clearTimeout(tooltipTimeout);
    }

    copyTooltip.textContent = success ? "Copied!" : "Copy failed";
    copyTooltip.className = success ? "tooltip show" : "tooltip show error";

    copyTooltip.classList.add("show");
    copyTooltip.setAttribute("aria-hidden", "false");

    tooltipTimeout = setTimeout(() => {
      copyTooltip.classList.remove("show");
      copyTooltip.setAttribute("aria-hidden", "true");
    }, 1500);
  }

  /**
   * Copies text to clipboard
   * @param {string} text - Text to copy
   * @returns {boolean} - Whether copy was successful
   */
  async function copyToClipboard(text) {
    if (
      !text ||
      text === "Generation failed" ||
      text === UI_ERROR_MESSAGES.NO_VALID_MASKS
    ) {
      showError("Nothing to copy");
      return false;
    }

    try {
      // Use the Clipboard API if available
      if (navigator.clipboard && navigator.clipboard.writeText) {
        try {
          await navigator.clipboard.writeText(text);

          showCopyTooltip(true);

          const container = ccNumberElement.parentElement;
          container.classList.add("copied");
          setTimeout(() => container.classList.remove("copied"), 1500);

          return true;
        } catch (clipboardError) {
          console.error("Clipboard API error:", clipboardError);

          if (clipboardError.name === "NotAllowedError") {
            showError(UI_ERROR_MESSAGES.CLIPBOARD_PERMISSION);
          } else {
            showError(UI_ERROR_MESSAGES.COPY_FAILED);
          }

          return tryFallbackCopy(text);
        }
      }

      return tryFallbackCopy(text);
    } catch (err) {
      console.error("Failed to copy text: ", err);
      showCopyTooltip(false);
      showError(UI_ERROR_MESSAGES.COPY_FAILED);
      return false;
    }
  }

  /**
   * Try to copy using the fallback execCommand method
   * @param {string} text - Text to copy
   * @returns {boolean} - Whether copy was successful
   */
  function tryFallbackCopy(text) {
    try {
      const textArea = document.createElement("textarea");
      textArea.value = text;
      textArea.style.position = "fixed"; // Avoid scrolling to bottom
      document.body.appendChild(textArea);
      textArea.focus();
      textArea.select();

      const successful = document.execCommand("copy");
      document.body.removeChild(textArea);

      if (successful) {
        showCopyTooltip(true);

        const container = ccNumberElement.parentElement;
        container.classList.add("copied");
        setTimeout(() => container.classList.remove("copied"), 1500);

        return true;
      }

      showCopyTooltip(false);
      showError(UI_ERROR_MESSAGES.COPY_FAILED);
      return false;
    } catch (error) {
      console.error("Fallback copy failed:", error);
      showCopyTooltip(false);
      showError(UI_ERROR_MESSAGES.COPY_FAILED);
      return false;
    }
  }

  /**
   * Adds the custom option to the dropdown if valid masks exist
   */
  async function updateCardTypeOptions() {
    try {
      const hasCustomMasks = await hasValidCustomMasks();

      let customOption = cardTypeSelect.querySelector(
        `option[value="${CUSTOM_CARD_TYPE}"]`,
      );

      if (hasCustomMasks) {
        if (!customOption) {
          customOption = document.createElement("option");
          customOption.value = CUSTOM_CARD_TYPE;
          customOption.textContent = "Custom";
          cardTypeSelect.appendChild(customOption);
        }
      } else {
        if (customOption) {
          cardTypeSelect.removeChild(customOption);

          if (cardTypeSelect.value === CUSTOM_CARD_TYPE) {
            cardTypeSelect.value = CARD_TYPES.VISA;
            chrome.storage.sync.set({ cardType: CARD_TYPES.VISA });
          }
        }
      }
    } catch (error) {
      console.error("Error updating card type options:", error);
      showError("Failed to load custom masks");
    }
  }

  /**
   * Initializes the UI
   */
  async function initializeUI() {
    try {
      initTheme();

      await updateCardTypeOptions();

      chrome.storage.sync.get(
        ["cardType", "generateOnOpen", "lastGeneratedNumber"],
        async (result) => {
          try {
            if (result.cardType) {
              const optionExists = Array.from(cardTypeSelect.options).some(
                (option) => option.value === result.cardType,
              );

              if (optionExists) {
                cardTypeSelect.value = result.cardType;
              }
            }

            const shouldGenerateNew = result.generateOnOpen !== false;

            if (shouldGenerateNew) {
              await generateNewCardNumber();
            } else {
              if (result.lastGeneratedNumber) {
                ccNumberElement.textContent = formatCardNumber(
                  result.lastGeneratedNumber,
                );
                ccNumberElement.parentElement.classList.remove("disabled");
              } else {
                const historyResult = await getHistory();
                if (historyResult.success && historyResult.history.length > 0) {
                  const lastGenerated = historyResult.history[0];
                  ccNumberElement.textContent = formatCardNumber(
                    lastGenerated.number,
                  );
                  chrome.storage.sync.set({
                    lastGeneratedNumber: lastGenerated.number,
                  });
                  ccNumberElement.parentElement.classList.remove("disabled");
                }
              }
            }
          } catch (error) {
            console.error("Error processing storage data:", error);
            showError("Failed to load saved settings");
          }
        },
      );

      cardTypeSelect.addEventListener("change", async () => {
        await generateNewCardNumber();
      });

      generateBtn.addEventListener("click", async () => {
        await generateNewCardNumber();
      });

      ccNumberElement.parentElement.addEventListener("click", () => {
        copyToClipboard(ccNumberElement.textContent.replace(/\s/g, ""));
      });

      ccNumberElement.parentElement.addEventListener("keydown", (e) => {
        if (e.key === "Enter" || e.key === " ") {
          e.preventDefault();
          copyToClipboard(ccNumberElement.textContent.replace(/\s/g, ""));
        }
      });

      settingsLink.addEventListener("click", (e) => {
        e.preventDefault();
        chrome.runtime.openOptionsPage();
      });
    } catch (error) {
      console.error("Error initializing UI:", error);
      showError("Failed to initialize application");
    }
  }

  initializeUI();
});

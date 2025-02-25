/**
 * Settings page for the CC Generator extension
 *
 * This script handles the initialization and management of the settings page,
 * including loading saved settings, updating toggle status, validating custom
 * configuration, saving settings, clearing history, resetting settings, and
 * displaying the history of generated card numbers.
 */

import { applyTheme } from "./theme.js";
import {
  loadSettings,
  saveSettings,
  getHistory,
  clearHistory,
  resetSettings,
} from "./storage.js";
import { parseCustomMask } from "./customMask.js";

document.addEventListener("DOMContentLoaded", () => {
  const generateOnOpenToggle = document.getElementById("generate-on-open");
  const themeSelect = document.getElementById("theme-select");
  const enableCustomMasksToggle = document.getElementById(
    "enable-custom-masks",
  );
  const customConfigTextarea = document.getElementById("custom-config");
  const customConfigError = document.getElementById("custom-config-error");
  const historyContainer = document.getElementById("history-container");
  const clearHistoryBtn = document.getElementById("clear-history");
  const resetSettingsBtn = document.getElementById("reset-settings");

  const formState = {
    isValid: true,
    errors: {},
    addError(field, message) {
      this.errors[field] = message;
      this.isValid = false;
    },
    clearErrors() {
      this.errors = {};
      this.isValid = true;
    },
  };

  initializeSettings();

  generateOnOpenToggle.addEventListener("change", function () {
    updateToggleStatus.call(this);
    saveCurrentSettings();
  });

  enableCustomMasksToggle.addEventListener("change", function () {
    updateToggleStatus.call(this);
    saveCurrentSettings();
  });

  themeSelect.addEventListener("change", function () {
    handleThemeChange();
    saveCurrentSettings();
  });

  clearHistoryBtn.addEventListener("click", handleClearHistory);
  resetSettingsBtn.addEventListener("click", handleResetSettings);

  customConfigTextarea.addEventListener(
    "input",
    debounce(validateCustomConfig, 500),
  );

  customConfigTextarea.addEventListener("blur", function () {
    validateCustomConfig();
    if (formState.isValid) {
      saveCurrentSettings();
    }
  });

  /**
   * Initialize the settings page by loading saved settings
   */
  async function initializeSettings() {
    try {
      const settings = await loadSettings();

      // Apply settings to form elements
      generateOnOpenToggle.checked = settings.generateOnOpen;
      themeSelect.value = settings.theme;
      enableCustomMasksToggle.checked = settings.enableCustomMasks;

      // Set custom masks
      if (settings.customMasks && settings.customMasks.length > 0) {
        customConfigTextarea.value = settings.customMasks.join("\n");
      }

      updateToggleStatusText(generateOnOpenToggle);
      updateToggleStatusText(enableCustomMasksToggle);

      displayHistory();

      applyTheme(settings.theme);

      customConfigTextarea.disabled = !settings.enableCustomMasks;

      if (settings.enableCustomMasks) {
        validateCustomConfig();
      }

      console.log("Settings loaded successfully");
    } catch (error) {
      console.error("Error initializing settings:", error);
      showGlobalError("Failed to load settings. Please try again.");
    }
  }

  /**
   * Update the text next to a toggle switch
   * @param {HTMLElement} toggleElement - The toggle input element
   */
  function updateToggleStatusText(toggleElement) {
    const statusElement =
      toggleElement.parentElement.querySelector(".toggle-status");
    if (statusElement) {
      statusElement.textContent = toggleElement.checked ? "Yes" : "No";
    }
  }

  /**
   * Handle toggle status changes
   */
  function updateToggleStatus() {
    updateToggleStatusText(this);

    if (this.id === "enable-custom-masks") {
      customConfigTextarea.disabled = !this.checked;

      if (this.checked) {
        validateCustomConfig();
      } else {
        hideError(customConfigError);
      }
    }

    formState.isValid = true;
  }

  /**
   * Handle theme changes
   */
  function handleThemeChange() {
    applyTheme(themeSelect.value);
  }

  /**
   * Validate custom configuration input
   * @returns {boolean} - True if valid, false otherwise
   */
  function validateCustomConfig() {
    if (!enableCustomMasksToggle.checked) {
      formState.isValid = true;
      return true;
    }

    const value = customConfigTextarea.value.trim();

    if (!value) {
      hideError(customConfigError);
      formState.isValid = true;
      return true;
    }

    const lines = value
      .split("\n")
      .map((line) => line.trim())
      .filter((line) => line.length > 0);

    const invalidLines = [];

    lines.forEach((line, index) => {
      try {
        parseCustomMask(line);
      } catch (error) {
        invalidLines.push({
          line: index + 1,
          text: line,
          error: error.message,
        });
      }
    });

    if (invalidLines.length > 0) {
      const errorMessages = invalidLines.map(
        (item) => `Line ${item.line}: "${item.text}" - ${item.error}`,
      );

      showError(
        customConfigError,
        `Invalid custom mask format:<br>${errorMessages.join("<br>")}`,
      );

      formState.isValid = false;
      return false;
    }

    hideError(customConfigError);
    formState.isValid = true;
    return true;
  }

  /**
   * Save current settings
   */
  async function saveCurrentSettings() {
    if (!validateCustomConfig()) {
      showGlobalError("Please fix the errors before saving.");
      return;
    }

    try {
      let customMasks = [];
      if (
        enableCustomMasksToggle.checked &&
        customConfigTextarea.value.trim()
      ) {
        customMasks = customConfigTextarea.value
          .split("\n")
          .map((line) => line.trim())
          .filter((line) => line.length > 0);
      }

      const currentSettings = await loadSettings();

      const settings = {
        generateOnOpen: generateOnOpenToggle.checked,
        theme: themeSelect.value,
        enableCustomMasks: enableCustomMasksToggle.checked,
        customMasks: customMasks,
        lastGeneratedNumber: currentSettings.lastGeneratedNumber,
      };

      await saveSettings(settings);

      console.log("Settings saved successfully");
    } catch (error) {
      console.error("Error saving settings:", error);
      showGlobalError(`Failed to save settings: ${error.message}`);
    }
  }

  /**
   * Handle clear history button click
   */
  async function handleClearHistory() {
    try {
      const confirmed = await showConfirmDialog(
        "Are you sure you want to clear your history? This cannot be undone.",
      );

      if (!confirmed) {
        return;
      }

      const result = await clearHistory();

      if (result && result.success) {
        await displayHistory();
        showSuccessMessage("History cleared successfully");
      } else {
        showGlobalError("Failed to clear history. Please try again.");
      }
    } catch (error) {
      console.error("Error clearing history:", error);
      showGlobalError(`Failed to clear history: ${error.message}`);
    }
  }

  /**
   * Handle reset settings button click
   */
  async function handleResetSettings() {
    try {
      const confirmed = await showConfirmDialog(
        "Are you sure you want to reset all settings to default values? This will not affect your history.",
      );

      if (!confirmed) {
        return;
      }

      const result = await resetSettings();

      if (result && result.success) {
        await initializeSettings();
        showSuccessMessage("Settings reset to defaults");
      } else {
        showGlobalError("Failed to reset settings. Please try again.");
      }
    } catch (error) {
      console.error("Error resetting settings:", error);
      showGlobalError(`Failed to reset settings: ${error.message}`);
    }
  }

  /**
   * Display the history of generated card numbers
   */
  async function displayHistory() {
    try {
      const result = await getHistory();
      const history = result.success ? result.history : [];

      historyContainer.innerHTML = "";

      if (!history || history.length === 0) {
        historyContainer.innerHTML = "<p>No history available</p>";
        return;
      }

      const logElement = document.createElement("pre");
      logElement.className = "history-log";

      history.forEach((item) => {
        const line = document.createElement("div");

        if (typeof item === "string") {
          line.textContent = `${formatCardNumber(item)} (Unknown)`;
        } else {
          const date = item.timestamp
            ? formatDate(new Date(item.timestamp))
            : "";
          line.textContent = `${formatCardNumber(item.number)} - ${item.type} ${
            date ? "- " + date : ""
          }`;
        }

        logElement.appendChild(line);
      });

      historyContainer.appendChild(logElement);
    } catch (error) {
      console.error("Error displaying history:", error);
      historyContainer.innerHTML = "<p>Failed to load history</p>";
    }
  }

  /**
   * Format a card number with spaces for readability
   *
   * @param {string} number - The card number to format
   * @returns {string} - Formatted card number
   */
  function formatCardNumber(number) {
    return number.replace(/(\d{4})(?=\d)/g, "$1 ");
  }

  /**
   * Format a date in a user-friendly way
   *
   * @param {Date} date - The date to format
   * @returns {string} - Formatted date string
   */
  function formatDate(date) {
    const today = new Date();
    const isToday =
      date.getDate() === today.getDate() &&
      date.getMonth() === today.getMonth() &&
      date.getFullYear() === today.getFullYear();

    if (isToday) {
      return `Today at ${date.toLocaleTimeString([], {
        hour: "2-digit",
        minute: "2-digit",
        hour12: true,
      })}`;
    }

    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);
    const isYesterday =
      date.getDate() === yesterday.getDate() &&
      date.getMonth() === yesterday.getMonth() &&
      date.getFullYear() === yesterday.getFullYear();

    if (isYesterday) {
      return `Yesterday at ${date.toLocaleTimeString([], {
        hour: "2-digit",
        minute: "2-digit",
        hour12: true,
      })}`;
    }

    const oneWeekAgo = new Date(today);
    oneWeekAgo.setDate(oneWeekAgo.getDate() - 7);
    const isThisWeek = date >= oneWeekAgo;

    if (isThisWeek) {
      // Show day of week and time
      return `${date.toLocaleDateString([], {
        weekday: "long",
      })} at ${date.toLocaleTimeString([], {
        hour: "2-digit",
        minute: "2-digit",
        hour12: true,
      })}`;
    }

    const isThisYear = date.getFullYear() === today.getFullYear();

    if (isThisYear) {
      return date.toLocaleDateString([], {
        month: "long",
        day: "numeric",
        weekday: "short",
      });
    }

    return date.toLocaleDateString([], {
      month: "long",
      day: "numeric",
      year: "numeric",
      weekday: "short",
    });
  }

  /**
   * Show error message for a specific element
   * @param {HTMLElement} element - Error element to show
   * @param {string} message - Error message
   */
  function showError(element, message) {
    element.innerHTML = message;
    element.classList.remove("hidden");
    element.setAttribute("aria-hidden", "false");
  }

  /**
   * Hide error message
   * @param {HTMLElement} element - Error element to hide
   */
  function hideError(element) {
    element.textContent = "";
    element.classList.add("hidden");
    element.setAttribute("aria-hidden", "true");
  }

  /**
   * Show a global error message
   * @param {string} message - Error message to display
   */
  function showGlobalError(message) {
    const errorDiv = document.createElement("div");
    errorDiv.className = "global-error";
    errorDiv.setAttribute("role", "alert");
    errorDiv.innerHTML = message;
    document.body.appendChild(errorDiv);

    setTimeout(() => {
      errorDiv.remove();
    }, 5000);
  }

  /**
   * Show success message
   * @param {string} message - Success message
   */
  function showSuccessMessage(message) {
    const successDiv = document.createElement("div");
    successDiv.className = "success-message";
    successDiv.setAttribute("role", "status");
    successDiv.textContent = message;
    document.body.appendChild(successDiv);

    setTimeout(() => {
      successDiv.remove();
    }, 3000);
  }

  /**
   * Show a confirmation dialog
   * @param {string} message - Confirmation message
   * @returns {Promise<boolean>} - Promise resolving to true if confirmed, false otherwise
   */
  function showConfirmDialog(message) {
    return new Promise((resolve) => {
      const modalContainer = document.createElement("div");
      modalContainer.className = "modal-container";

      const modalContent = document.createElement("div");
      modalContent.className = "modal-content";

      const messageElement = document.createElement("p");
      messageElement.textContent = message;

      const buttonsContainer = document.createElement("div");
      buttonsContainer.className = "modal-buttons";

      const confirmButton = document.createElement("button");
      confirmButton.className = "danger-btn";
      confirmButton.textContent = "Confirm";
      confirmButton.addEventListener("click", () => {
        document.body.removeChild(modalContainer);
        resolve(true);
      });

      const cancelButton = document.createElement("button");
      cancelButton.className = "secondary-btn";
      cancelButton.textContent = "Cancel";
      cancelButton.addEventListener("click", () => {
        document.body.removeChild(modalContainer);
        resolve(false);
      });

      buttonsContainer.appendChild(cancelButton);
      buttonsContainer.appendChild(confirmButton);

      modalContent.appendChild(messageElement);
      modalContent.appendChild(buttonsContainer);

      modalContainer.appendChild(modalContent);

      document.body.appendChild(modalContainer);

      confirmButton.focus();
    });
  }

  /**
   * Debounce function to limit how often a function is called
   * @param {Function} func - Function to debounce
   * @param {number} wait - Wait time in milliseconds
   * @returns {Function} - Debounced function
   */
  function debounce(func, wait) {
    let timeout;
    return function (...args) {
      const context = this;
      clearTimeout(timeout);
      timeout = setTimeout(() => func.apply(context, args), wait);
    };
  }
});

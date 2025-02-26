/**
 * Theme management for CC Generator
 *
 * Handles theme application, detection, and persistence
 */

// Theme constants
const THEMES = {
  LIGHT: "light",
  DARK: "dark",
  AUTO: "auto",
};

/**
 * Apply the specified theme to the document
 * @param {string} theme - The theme to apply ('light', 'dark', or 'auto')
 */
function applyTheme(theme) {
  document.body.classList.remove("theme-light", "theme-dark");

  if (theme === THEMES.AUTO) {
    if (
      window.matchMedia &&
      window.matchMedia("(prefers-color-scheme: dark)").matches
    ) {
      document.body.classList.add("theme-dark");
    } else {
      document.body.classList.add("theme-light");
    }

    setupSystemThemeListener();
  } else {
    document.body.classList.add(`theme-${theme}`);
  }

  chrome.storage.sync.set({ theme });
}

/**
 * Set up a listener for system theme changes (for auto theme)
 */
function setupSystemThemeListener() {
  if (window.matchMedia) {
    const darkModeMediaQuery = window.matchMedia(
      "(prefers-color-scheme: dark)",
    );

    try {
      // Chrome & Firefox
      darkModeMediaQuery.addEventListener("change", (e) => {
        if (getCurrentTheme() === THEMES.AUTO) {
          document.body.classList.remove("theme-light", "theme-dark");
          document.body.classList.add(e.matches ? "theme-dark" : "theme-light");
        }
      });
    } catch {
      // Safari
      darkModeMediaQuery.addListener((e) => {
        if (getCurrentTheme() === THEMES.AUTO) {
          document.body.classList.remove("theme-light", "theme-dark");
          document.body.classList.add(e.matches ? "theme-dark" : "theme-light");
        }
      });
    }
  }
}

/**
 * Get the current theme from storage
 * @returns {Promise<string>} A promise that resolves to the current theme
 */
function getCurrentTheme() {
  return new Promise((resolve) => {
    chrome.storage.sync.get(["theme"], (result) => {
      resolve(result.theme || THEMES.LIGHT); // Default to light theme
    });
  });
}

/**
 * Initialize theme based on saved preference
 */
async function initTheme() {
  const theme = await getCurrentTheme();
  applyTheme(theme);
}

// Export the functions and constants
export { THEMES, applyTheme, getCurrentTheme, initTheme };

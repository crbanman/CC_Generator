/**
 * Background service worker for CC Generator.
 *
 * It handles the installation and update of the extension,
 * and listens for messages from the popup or content scripts.
 */
const DEFAULT_SETTINGS = {
  generateOnOpen: true,
  theme: "light",
  enableCustomMasks: false,
  customMasks: [],
  lastGeneratedNumber: null,
};

// Listen for installation
chrome.runtime.onInstalled.addListener((details) => {
  if (details.reason === "install") {
    // Set default options on install
    chrome.storage.sync.set({
      cardType: "visa",
      lastGeneratedNumber: null,
      generateOnOpen: true,
    });

    console.log("CC Generator extension installed.");
  } else if (details.reason === "update") {
    console.log(
      "CC Generator extension updated from version " +
        details.previousVersion +
        " to " +
        chrome.runtime.getManifest().version,
    );

    // Check and fix settings on update
    checkAndFixSettings();
  }
});

// Check and fix any missing settings
async function checkAndFixSettings() {
  try {
    const settings = await chrome.storage.sync.get(null);

    if (settings.generateOnOpen === undefined) {
      await chrome.storage.sync.set({
        generateOnOpen: DEFAULT_SETTINGS.generateOnOpen,
      });
    }

    if (settings.lastGeneratedNumber === undefined) {
      await chrome.storage.sync.set({
        lastGeneratedNumber: DEFAULT_SETTINGS.lastGeneratedNumber,
      });
    }
  } catch (error) {
    console.error("Error checking settings:", error);
  }
}

checkAndFixSettings();

// Listen for messages from the popup or content scripts
chrome.runtime.onMessage.addListener(function (request, sender, sendResponse) {
  if (request.action === "generateCard") {
    sendResponse({ success: true });
  }

  return true;
});

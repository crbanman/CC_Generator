/**
 * Helper functions for testing the Chrome extension
 */

/**
 * Get the extension ID for the loaded extension
 * @param {import('@playwright/test').Browser} browser
 * @returns {Promise<string>} The extension ID
 */
export async function getExtensionId(browser) {
  const page = await browser.newPage();

  await page.goto("chrome://extensions/");

  // Extract the extension ID
  const extensionId = await page.evaluate(() => {
    const extensions = document
      .querySelector("extensions-manager")
      .shadowRoot.querySelector("extensions-item-list")
      .shadowRoot.querySelectorAll("extensions-item");

    for (const extension of extensions) {
      const name = extension.shadowRoot
        .querySelector("#name")
        .textContent.trim();
      if (name === "CC Generator") {
        return extension.getAttribute("extension-id");
      }
    }
    return null;
  });

  await page.close();

  if (!extensionId) {
    throw new Error("Could not find extension ID for CC Generator");
  }

  return extensionId;
}

/**
 * Open the extension popup
 * @param {import('@playwright/test').Page} page
 * @param {string} extensionId
 * @returns {Promise<void>}
 */
export async function openExtensionPopup(page, extensionId) {
  const url = `chrome-extension://${extensionId}/html/popup.html`;
  await page.goto(url);

  // Wait for the page to be fully loaded
  await page.waitForLoadState("networkidle");
}

/**
 * Open the extension settings page
 * @param {import('@playwright/test').Page} page
 * @param {string} extensionId
 * @returns {Promise<void>}
 */
export async function openExtensionSettings(page, extensionId) {
  const url = `chrome-extension://${extensionId}/html/settings.html`;
  await page.goto(url);

  // Wait for the page to be fully loaded
  await page.waitForLoadState("networkidle");
}

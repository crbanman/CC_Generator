import { test as base, chromium } from "@playwright/test";
import path from "path";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const distPath = path.join(__dirname, "..", "dist");

// User data directory for persistent context
const userDataDir = path.join(__dirname, "..", ".playwright-user-data");

/**
 * Fixtures for Playwright tests which allows the
 * testing of chrome extensions.
 *
 * @see https://playwright.dev/docs/chrome-extensions
 */
export const test = base.extend({
  context: async ({}, use) => {
    // Get headless setting from the configuration
    // The headless setting is now controlled by playwright.config.js
    const context = await chromium.launchPersistentContext(userDataDir, {
      channel: "chromium",
      args: [
        `--disable-extensions-except=${distPath}`,
        `--load-extension=${distPath}`,
      ],
      permissions: ["clipboard-read", "clipboard-write"],
    });
    await use(context);
    await context.close();
  },
  extensionId: async ({ context }, use) => {
    // Wait for the service worker to be available
    let [background] = context.serviceWorkers();
    if (!background) {
      background = await context.waitForEvent("serviceworker");
    }

    const extensionId = background.url().split("/")[2];
    await use(extensionId);
  },
  page: async ({ context }, use) => {
    const page = await context.newPage();
    await use(page);
  },
});

export const expect = test.expect;

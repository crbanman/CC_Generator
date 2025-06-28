import { test as base, chromium } from "@playwright/test";
import path from "path";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const distPath = path.join(__dirname, "..", "dist");

// User data directory for persistent context
const userDataDir = path.join(__dirname, "..", ".playwright-user-data");

/**
 * Fixtures for Playwright tests which allows the
 * testing of cross-browser extensions.
 *
 * @see https://playwright.dev/docs/chrome-extensions
 */
export const test = base.extend({
  context: async ({}, use) => {
    // Build Chrome version first  
    const { exec } = await import("child_process");
    await new Promise((resolve, reject) => {
      exec("pnpm build && pnpm update-manifest", (error) => {
        if (error) reject(error);
        else resolve();
      });
    });
    
    // Launch Chrome with extension
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
    // For Chrome, get from service worker
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

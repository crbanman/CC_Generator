import { test, expect } from "./fixtures.js";
import { openExtensionSettings, openExtensionPopup } from "./helpers.js";

test.describe("Extension Settings", () => {
  test("should display the settings page correctly", async ({
    page,
    extensionId,
  }) => {
    await openExtensionSettings(page, extensionId);

    // Check that the main elements are visible
    await expect(
      page.locator('h1:has-text("CC Generator Settings")'),
    ).toBeVisible();
    await expect(page.locator("#theme-select")).toBeVisible();

    // Instead of checking the hidden checkbox directly, check its container
    await expect(
      page.locator(".toggle-container:has(#generate-on-open)"),
    ).toBeVisible();
  });

  test("should change theme when selecting a different option", async ({
    page,
    extensionId,
  }) => {
    await openExtensionSettings(page, extensionId);

    // Wait for the theme select to be visible
    await expect(page.locator("#theme-select")).toBeVisible();

    // Get the current theme
    const initialTheme = await page.locator("#theme-select").inputValue();

    // Select a different theme
    const newTheme = initialTheme === "dark" ? "light" : "dark";
    await page.selectOption("#theme-select", newTheme);

    // Reload the page to verify the theme was saved
    await page.reload();
    await page.waitForLoadState("networkidle");

    // Check that the selected theme is still the new theme
    await expect(page.locator("#theme-select")).toHaveValue(newTheme);

    // Check that the body has the appropriate theme class
    if (newTheme === "dark") {
      await expect(page.locator("body")).toHaveClass(/theme-dark/);
    } else {
      await expect(page.locator("body")).toHaveClass(/theme-light/);
    }
  });

  test("should toggle generate on open setting", async ({
    page,
    extensionId,
  }) => {
    await openExtensionSettings(page, extensionId);

    // Wait for the toggle container to be visible
    await expect(
      page.locator(".toggle-container:has(#generate-on-open)"),
    ).toBeVisible();

    // Get the current state by checking the toggle status text
    const toggleStatus = await page
      .locator(".toggle-container:has(#generate-on-open) .toggle-status")
      .textContent();
    const isEnabled = toggleStatus === "Yes";

    // Click the toggle label (the second label with for='generate-on-open')
    await page.locator("label.toggle-label[for='generate-on-open']").click();

    // Reload the page to verify the setting was saved
    await page.reload();
    await page.waitForLoadState("networkidle");

    // Check that the setting is still toggled by checking the toggle status text
    const newToggleStatus = await page
      .locator(".toggle-container:has(#generate-on-open) .toggle-status")
      .textContent();
    const newIsEnabled = newToggleStatus === "Yes";
    expect(newIsEnabled).toBe(!isEnabled);
  });

  test("should be able to customize card number format", async ({
    page,
    extensionId,
  }) => {
    await openExtensionSettings(page, extensionId);

    // Wait for the page to load
    await page.waitForLoadState("networkidle");

    // Navigate to the Custom Number Configuration section
    await expect(
      page.locator('h2:has-text("Custom Number Configuration")'),
    ).toBeVisible();

    // First check that the Custom option is not available in the popup
    await openExtensionPopup(page, extensionId);
    const customOptionBefore = await page
      .locator("#card-type option[value='custom']")
      .count();
    expect(customOptionBefore).toBe(0);
    await page.goBack();
    await page.waitForLoadState("networkidle");

    // Now enable custom number patterns
    await page.locator("label.toggle-label[for='enable-custom-masks']").click();

    // Check that the custom config textarea is visible
    await expect(page.locator("#custom-config")).toBeVisible();

    // Add a custom pattern
    await page.locator("#custom-config").fill("4111/16");

    // Click outside the textarea to save
    await page.locator("h2:has-text('Custom Number Configuration')").click();

    // Now go to the popup and check if a card number is generated
    await openExtensionPopup(page, extensionId);

    // Wait for the generate button to be visible
    await expect(page.locator("#generate-btn")).toBeVisible();

    // Check that the Custom option is now available in the dropdown
    const customOptionAfter = await page
      .locator("#card-type option[value='custom']")
      .count();
    expect(customOptionAfter).toBe(1);

    // Select "Custom" from the card type dropdown
    await page.locator("#card-type").selectOption("custom");

    // Generate a card
    await page.locator("#generate-btn").click();

    // Wait for the card number to be populated
    await page.waitForFunction(() => {
      const input = document.querySelector("#cc-number");
      return input?.textContent && input.textContent.length > 0;
    });

    // Get the generated card number
    const cardNumber = await page.locator("#cc-number").textContent();

    // Check that the card number is a valid credit card number (starts with a digit)
    expect(cardNumber.replace(/\s+/g, "")).toMatch(/^\d+$/);
  });
});

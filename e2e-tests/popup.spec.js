import { test, expect } from "./fixtures.js";
import { openExtensionPopup } from "./helpers.js";

test.describe("Extension Popup", () => {
  test("should display the popup UI correctly", async ({
    page,
    extensionId,
  }) => {
    await openExtensionPopup(page, extensionId);

    // Check that the main elements are visible
    await expect(page.locator("#card-type")).toBeVisible();
    await expect(page.locator("#generate-btn")).toBeVisible();
    await expect(page.locator("#cc-number")).toBeVisible();
  });

  test("should generate a credit card number when clicking the generate button", async ({
    page,
    extensionId,
  }) => {
    await openExtensionPopup(page, extensionId);

    // Wait for the generate button to be visible
    await expect(page.locator("#generate-btn")).toBeVisible();

    // Get the initial card number
    const initialCardNumber = await page.locator("#cc-number").textContent();

    // Click the generate button
    await page.locator("#generate-btn").click();

    // Get the new card number
    const newCardNumber = await page.locator("#cc-number").textContent();

    // Verify the generated number has the correct format (digits and possibly spaces or dashes)
    expect(newCardNumber).toMatch(/^[\d\s-]+$/);

    // Verify the number changed (not always reliable if by chance the same number is generated)
    expect(newCardNumber).not.toEqual(initialCardNumber);
  });

  test("should copy the generated card number to clipboard when clicking on it", async ({
    page,
    extensionId,
  }) => {
    await openExtensionPopup(page, extensionId);

    // Wait for the card number to be visible
    await expect(page.locator("#cc-number")).toBeVisible();

    // Click on the card number to copy it
    await page.locator("#cc-number").click();

    // Verify the copy tooltip is visible
    await expect(page.locator("#copy-tooltip")).toBeVisible();
  });

  test("should change card type when selecting a different option", async ({
    page,
    extensionId,
  }) => {
    await openExtensionPopup(page, extensionId);

    // Wait for the card type select to be visible
    await expect(page.locator("#card-type")).toBeVisible();

    // Select Visa card type
    await page.selectOption("#card-type", "visa");

    // Wait for the generate button to be visible
    await expect(page.locator("#generate-btn")).toBeVisible();

    // Generate a card
    await page.locator("#generate-btn").click();

    // Get the generated card number
    const cardNumber = await page.locator("#cc-number").textContent();

    // Visa cards start with 4
    expect(cardNumber.replace(/\s+/g, "").startsWith("4")).toBeTruthy();

    // Now select Mastercard
    await page.selectOption("#card-type", "mastercard");

    // Generate a new card
    await page.locator("#generate-btn").click();

    // Get the new generated card number
    const newCardNumber = await page.locator("#cc-number").textContent();

    // Mastercard cards start with 5 or 2
    const firstDigit = newCardNumber.replace(/\s+/g, "").charAt(0);
    expect(["5", "2"].includes(firstDigit)).toBeTruthy();
  });
});

# End-to-End Tests for CC Generator Chrome Extension

This directory contains end-to-end tests for the CC Generator Chrome extension using Playwright.

## Prerequisites

- Node.js 20.0.0 or higher
- pnpm 9.15.0 or higher

## Setup

1. Install dependencies:

   ```
   pnpm install
   ```

2. Build the extension:
   ```
   pnpm run build
   ```

## Running Tests

### Run all tests with clean context (recommended)

```
pnpm run test:e2e:clean
```

Tests run in headless mode by default.

### Run tests in headed mode (visible browser)

```
pnpm run test:e2e:headed
```

### Run tests in headed mode with clean context

```
pnpm run test:e2e:headed:clean
```

### Run tests with UI mode and clean context

```
pnpm run test:e2e:ui:clean
```

### Run tests in debug mode with clean context

```
pnpm run test:e2e:debug:clean
```

### Run tests without clearing context (not recommended)

```
pnpm run test:e2e
```

## Important: Persistent Context

When testing Chrome extensions with Playwright, a persistent context is used to load the extension. This context is stored in the `.playwright-user-data` directory.

If you encounter issues with tests failing due to state from previous test runs, you should:

1. Use the `:clean` variants of the test commands, which automatically clear the persistent context before running tests
2. Manually delete the `.playwright-user-data` directory

The `.playwright-user-data` directory is excluded from git in the `.gitignore` file.

## Test Structure

- `helpers.js` - Helper functions for interacting with the Chrome extension
- `popup.spec.js` - Tests for the extension popup functionality
- `settings.spec.js` - Tests for the extension settings functionality

## How It Works

These tests use Playwright to launch Chrome with the extension loaded and then interact with the extension's UI to verify its functionality. The tests:

1. Launch Chrome with the extension loaded
2. Get the extension ID
3. Navigate to the extension's popup or settings page
4. Interact with the UI elements
5. Verify the expected behavior

## Notes

- The tests require the extension to be built first (`pnpm run build`)
- Tests run in headless mode by default for faster execution
- Use the `--headed` flag or the headed script variants to see the browser interactions
- The extension ID is dynamically retrieved during test execution

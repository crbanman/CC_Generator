# Credit Card Generator

A cross-platform browser extension for generating valid test credit card numbers for development and testing purposes. Available for both Chrome and Firefox.

## Features

- Generate valid credit card numbers for major card types (Visa, Mastercard, American Express, Discover)
- Create custom card numbers with specific prefixes and lengths
- Validate credit card numbers using the Luhn algorithm
- Identify card types from existing numbers
- Dark/light theme support
- Persistent settings storage

## Installation

### From Chrome Web Store

1. Visit the [Chrome Web Store page for CC Generator](https://chrome.google.com/webstore/detail/cc-generator/klcpekhgaebbghffffpofgaipfcdplkc)
2. Click "Add to Chrome"
3. Confirm the installation

### Manual Installation - Chrome (Developer Mode)

1. Download or clone this repository
2. Build the Chrome version: `pnpm package`
3. Open Chrome and navigate to `chrome://extensions/`
4. Enable "Developer mode" in the top-right corner
5. Click "Load unpacked" and select the `dist` directory
6. The extension should now be installed and visible in your toolbar

### Manual Installation - Firefox (Developer Mode)

1. Download or clone this repository
2. Build the Firefox version: `pnpm package:firefox`
3. Open Firefox and navigate to `about:debugging`
4. Click "This Firefox" in the sidebar
5. Click "Load Temporary Add-on"
6. Navigate to the `build` directory and select `cc-generator-firefox-v*.zip`
7. The extension should now be installed and visible in your toolbar

### Firefox Add-ons Store (Coming Soon)

Firefox add-on store submission is planned for a future release.

## Usage

1. Click the CC Generator icon in your browser toolbar
2. Select the desired card type from the dropdown
3. Click "Generate Card Number" to create a new test card number
4. Click "Copy" to copy the number to your clipboard
5. Paste the number wherever you need it for testing
6. Access additional settings via the settings page

The extension works identically in both Chrome and Firefox.

## Development

### Prerequisites

- Node.js (v20 or higher)
- pnpm (v9 or higher)

### Setup

1. Clone the repository
2. Install dependencies:

```bash
pnpm install
```

### Testing

This project uses Vitest for unit testing and Playwright for end-to-end testing.

#### Unit Tests

The following unit test commands are available:

```bash
# Run tests once
pnpm test

# Run tests in watch mode
pnpm test:watch

# Run tests with coverage
pnpm test:coverage
```

#### End-to-End Tests

The project includes end-to-end tests that verify the extension's functionality in Chrome.

```bash
# Run e2e tests with clean context (recommended)
pnpm test:e2e:clean

# Run e2e tests in headed mode (visible browser) with clean context
pnpm test:e2e:headed:clean

# Run e2e tests with UI mode and clean context
pnpm test:e2e:ui:clean

# Run e2e tests in debug mode with clean context
pnpm test:e2e:debug:clean
```

See the [e2e-tests/README.md](e2e-tests/README.md) file for more details on the end-to-end tests.

### Building and Packaging

The extension supports both Chrome and Firefox. Use the appropriate build commands:

#### Chrome Extension

```bash
# Clean, build, and create a Chrome distribution package
pnpm package
```

#### Firefox Extension

```bash
# Clean, build, and create a Firefox distribution package
pnpm package:firefox
```

#### Build Commands Reference

```bash
# Build Chrome version only (creates dist/ directory)
pnpm build && pnpm update-manifest

# Build Firefox version only (creates dist/ directory)  
pnpm build:firefox

# Package Chrome extension (creates build/cc-generator-v*.zip)
pnpm package

# Package Firefox extension (creates build/cc-generator-firefox-v*.zip)
pnpm package:firefox
```

The build process:

1. Cleans previous build artifacts
2. Creates a `dist` directory with all necessary extension files
3. Updates the manifest.json with the version from package.json
4. Packages everything into a zip file in the `build` directory

You can also specify a custom version:

```bash
# Build Chrome extension with a specific version
VERSION=2.1.0 pnpm package

# Build Firefox extension with a specific version  
VERSION=2.1.0 pnpm package:firefox
```

The packaged zip files will be named according to the browser and version:
- Chrome: `cc-generator-v2.0.0.zip`
- Firefox: `cc-generator-firefox-v2.0.0.zip`

### Release Process

The project uses GitHub Actions to automatically build and release the extension when a new version tag is pushed. To create a new release:

1. Update the version in `package.json`
2. Create and push a git tag manually:

```bash
git tag -a v1.2.3 -m "Release v1.2.3"
git push origin v1.2.3
```

This will:

1. Create a git tag with your specified version (e.g., `v1.2.3`)
2. Push the tag to GitHub
3. Trigger the release workflow which will:
   - Extract the version from the tag
   - Build and package the extension with that version
   - Create a GitHub release with the packaged extension

The release will be available on the GitHub Releases page with the extension zip file attached.

### Project Structure

- `js/` - Core JavaScript modules
  - `background.js` - Service worker background script
  - `cardTypes.js` - Card type definitions and validation
  - `customMask.js` - Custom mask parsing and validation
  - `generator.js` - Credit card number generation
  - `luhn.js` - Luhn algorithm implementation
  - `popup.js` - Main popup UI functionality
  - `settings.js` - Settings page functionality
  - `storage.js` - Chrome storage management
  - `theme.js` - Theme management (dark/light)
- `html/` - HTML templates for popup and settings
- `css/` - Stylesheets
- `images/` - Extension icons and images
- `test/` - Test files
  - `cardTypes.test.js` - Tests for card type functionality
  - `customMask.test.js` - Tests for custom mask parsing
  - `generator.test.js` - Tests for card number generation
  - `luhn.test.js` - Tests for Luhn algorithm

## License

This project is licensed under the GPL-3.0 License.

## Disclaimer

The credit card numbers generated by this extension are for testing purposes only. They follow the format and validation rules of real credit cards but cannot be used for actual transactions. Do not attempt to use these numbers for real purchases.

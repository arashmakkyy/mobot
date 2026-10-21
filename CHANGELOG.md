# Changelog

All notable changes to Mobot are documented here. Mobot follows the version
number of the bundled simulator release it is based on.

## 5.28.1 — 2026-10-21

### Added

- English and Persian interfaces with an in-extension language switch.
- RTL layout for Persian while the simulated website remains LTR.
- Bundled Vazirmatn font so Persian text renders consistently inside injected
  simulator pages.
- Project documentation, privacy notes, third-party notices, validation script,
  and GitHub Actions workflow.

### Changed

- Rebranded the extension as **Mobot** with new icons, logo, and product copy.
- Removed vendor branding, vendor links, brand assets, analytics endpoints, and
  legacy partner hooks.
- Removed Pro, Free, account, subscription, trial, and payment concepts. Every
  device and local feature is available without an account.
- Removed device tier flags and `(PRO)` markers while preserving legitimate
  device-model names such as `iPhone 14 PRO`.
- Reduced the shipped locales to English and Persian.
- Kept screenshots (PNG/WebP) and local WebM recording; removed cloud upload,
  share-link, GIF, and MP4 conversion paths.
- Removed unused background modules and dead account, Pro, trial, and contact
  UI.
- Replaced the popup and extension icons with Mobot artwork.
- Updated the manifest to version `5.28.1` and author `Mobot contributors`.

### Fixed

- Screenshot and recording shortcuts now reach the simulator reliably.
- The offscreen tab-capture page has valid HTML and no stale script reference.
- Camera and microphone permission iframes now run JavaScript instead of
  referencing missing TypeScript files.
- Error-message links point to the Mobot issue tracker instead of legacy
  support URLs.
- Removed stale analytics storage identifiers and event listeners.

### Security and privacy

- No analytics, telemetry, account backend, or cloud capture service is part of
  this build.
- Screenshots and recordings stay local and are downloaded by the user.
- The extension requests `<all_urls>` because it must simulate arbitrary sites;
  see [PRIVACY.md](PRIVACY.md) for the full permission explanation.

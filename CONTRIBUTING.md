# Contributing to Mobot

Thanks for helping improve Mobot. This repository contains the built extension;
the original source tree, source maps, and build pipeline were not available
for this release. Please keep changes focused and test them in a real Chromium
profile before opening a pull request.

## Ground rules

- Keep Mobot local-first. Do not add analytics, telemetry, accounts,
  subscriptions, trials, advertising, or cloud upload/conversion.
- Do not reintroduce vendor branding, vendor links, vendor endpoints, or brand
  assets. The project name is **Mobot**.
- Keep English and Persian locale files in sync. Every UI string should be
  available in both languages.
- Persian must use RTL layout. The simulated website iframe must remain LTR.
- Device model names may contain words such as "Pro" (for example,
  `iPhone 14 PRO`). Do not add tier markers such as `(PRO)` or feature gates.
- All features are available to everyone. Do not add Free/Pro/account checks.
- Keep the extension usable without a network connection to any Mobot service.

## Before you open a pull request

1. Run the validation script:

   ```sh
   npm run validate
   ```

2. Load the repository folder as an unpacked extension in Chromium and check:
   - the simulator opens from the toolbar button and the context menu;
   - English and Persian settings render correctly;
   - Persian is RTL and the simulated iframe is LTR;
   - a screenshot downloads;
   - a short WebM recording downloads;
   - no console errors are introduced.

3. Describe the change, the reason for it, and the tests you ran.

## Editing the compiled bundle

Most runtime files are minified webpack bundles. Prefer small, targeted edits
with comments where the code is not self-explanatory. Avoid reformatting whole
bundles, because that makes review and future maintenance much harder. If you
are fixing a behavior, include the exact user flow you used to reproduce it.

## Locale changes

`_locales/en/messages.json` is the source of truth. Add the same key to
`_locales/fa/messages.json` and keep the two files at the same key count. Use
the existing `MobotI18n` wrapper rather than calling `chrome.i18n` directly in
new UI code.

## Reporting bugs

Use the GitHub issue tracker:

<https://github.com/arashmakkyy/mobot/issues>

Include the Mobot version, browser and version, operating system, steps to
reproduce, and any relevant console output. Do not include passwords, private
page content, or personal data in a public issue.

## Code of conduct

By participating, you agree to follow the [Code of Conduct](CODE_OF_CONDUCT.md).

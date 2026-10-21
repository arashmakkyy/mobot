# Privacy

Mobot is designed as a local-first browser extension. It has no account system,
no subscription or trial, no analytics service, and no Mobot-operated server.

## Data Mobot stores

Mobot uses Chrome's extension storage for settings such as:

- the selected interface language (`mobot_language`);
- simulator preferences, including device layout, zoom, and capture options;
- temporary window state used to keep the simulator in sync across tabs.

These values stay in your browser profile. If Chrome sync is enabled for
extensions, Chrome may sync settings according to your Chrome settings. Mobot
does not operate the sync service.

## Data Mobot does not collect

- No names, email addresses, accounts, or sign-in credentials.
- No analytics, telemetry, advertising identifiers, or usage events.
- No page content, URLs, screenshots, or recordings are uploaded to a Mobot
  server. Mobot has no such server.
- No cloud screenshot upload, share-link service, GIF conversion, or MP4
  conversion. Those legacy features and their remote endpoints are removed
  from this build.

Screenshots and WebM recordings are created in the browser and downloaded
locally when you choose a download action.

## Network activity

Mobot loads the website you are testing in an iframe, just as a browser would
load that site. The site's own privacy policy and network activity apply to
that request. Mobot does not proxy the site through a Mobot service.

The extension opens GitHub only when you click a GitHub link, such as the
project link in Settings or an issue link in an error message.

## Permissions

| Permission | Why Mobot uses it |
| --- | --- |
| `<all_urls>` | Load and simulate arbitrary websites, and inject the simulator UI. |
| `scripting` | Inject the simulator, spoofer, and language runtime into the active tab. |
| `tabs` | Find the active tab, open the simulator, and manage capture. |
| `activeTab` | Start a tab capture after you explicitly invoke Mobot. |
| `webRequest` | Inspect and adjust response headers that would otherwise block the simulated page from being framed. |
| `declarativeNetRequest` | Apply per-tab request-header rules for the simulated user agent and framing. |
| `webNavigation` | Track frames created for the simulator and keep them associated with the right tab. |
| `storage` | Save settings, language, and simulator window state. |
| `contextMenus` | Add the Mobot right-click menu. |
| `tabCapture` | Record the active tab locally as WebM. |
| `offscreen` | Run the local tab-capture recorder outside the visible page. |
| `commands` | Provide keyboard shortcuts for screenshots and recording. |

Mobot does not sell data, share data with advertisers, or use data for
creditworthiness or lending decisions.

## Third-party content

The simulator bundles open-source components and the Vazirmatn font. Their
licenses are listed in [THIRD-PARTY-LICENSES.md](THIRD-PARTY-LICENSES.md).

## Contact

For privacy questions, open an issue at
<https://github.com/arashmakkyy/mobot/issues>. For security reports, use the
private process in [SECURITY.md](SECURITY.md).

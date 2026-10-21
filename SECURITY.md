# Security policy

## Supported versions

| Version | Supported |
| --- | --- |
| 5.28.x | Yes |
| Older builds | No |

Mobot is distributed from GitHub only. There is no Mobot server, account
system, or cloud capture service in this build.

## Reporting a vulnerability

Please do **not** open a public issue for a security vulnerability. Use GitHub's
private reporting flow:

<https://github.com/arashmakkyy/mobot/security/advisories/new>

Include:

- the Mobot version and browser version;
- the operating system;
- a clear description of the issue and its impact;
- reproduction steps or a minimal proof of concept;
- any relevant logs, screenshots, or files, with secrets removed.

You will receive an acknowledgement as soon as possible. This is a
maintainer-run project, so response times are best effort. Please allow time
for a fix before public disclosure.

## Scope

Examples of in-scope issues:

- extension-code injection or privilege escalation;
- bypasses of the extension's intended origin/frame boundaries;
- exposure of local settings or recorded media to an unintended party;
- remote code execution or unexpected network exfiltration;
- vulnerabilities in the bundled third-party code that affect Mobot users.

Examples of out-of-scope reports:

- websites blocking iframe embedding (a known browser/site policy limitation);
- missing features or visual bugs;
- issues that require an already-compromised browser profile;
- reports about third-party sites loaded in the simulator, unless Mobot
  materially changes their security properties.

## Safe harbor

Good-faith security research that follows this policy will not be pursued
legally by the project. Do not access other people's data, disrupt services, or
publish details before a fix is available.

## No bug bounty

Mobot does not offer a paid bug bounty. Responsible reports are still greatly
appreciated and will be credited if you wish.

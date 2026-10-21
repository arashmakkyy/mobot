import { execFileSync } from "node:child_process";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const errors = [];
const notes = [];

const fail = (message) => errors.push(message);
const read = (rel) => fs.readFileSync(path.join(root, rel), "utf8");
const exists = (rel) => fs.existsSync(path.join(root, rel));
const readJson = (rel) => JSON.parse(read(rel));

function assert(condition, message) {
  if (!condition) fail(message);
}

function walk(dir) {
  const out = [];
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    if (entry.name === ".git" || entry.name === "node_modules") continue;
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) out.push(...walk(full));
    else if (entry.isFile()) out.push(full);
  }
  return out;
}

const rel = (file) => path.relative(root, file).replaceAll("\\", "/");

// ---------------------------------------------------------------- manifest
let manifest;
try {
  manifest = readJson("manifest.json");
} catch (error) {
  fail(`manifest.json is not valid JSON: ${error.message}`);
}

if (manifest) {
  assert(manifest.manifest_version === 3, "manifest_version must be 3");
  assert(manifest.version === "5.28.1", "manifest version must be 5.28.1");
  assert(manifest.author === "Mobot contributors", "manifest author must be Mobot contributors");
  assert(manifest.default_locale === "en", "default_locale must be en");
  assert(manifest.background?.service_worker === "js/background.js", "service worker must be js/background.js");
  assert(
    Array.isArray(manifest.host_permissions) &&
      manifest.host_permissions.length === 1 &&
      manifest.host_permissions[0] === "<all_urls>",
    "host_permissions must be exactly <all_urls>",
  );

  for (const permission of [
    "webRequest",
    "scripting",
    "tabs",
    "activeTab",
    "webNavigation",
    "storage",
    "contextMenus",
    "tabCapture",
    "offscreen",
    "commands",
  ]) {
    assert(manifest.permissions?.includes(permission), `missing permission: ${permission}`);
  }

  const commands = Object.keys(manifest.commands || {});
  for (const command of [
    "start-stop-video-capture",
    "take-screenshot-1",
    "take-screenshot-2",
    "take-screenshot-3",
    "take-screenshot-4",
  ]) {
    assert(commands.includes(command), `missing command: ${command}`);
  }

  const contentScript = manifest.content_scripts?.[0];
  assert(contentScript?.js?.includes("js/frame-element-spoofer.js"), "frame spoofer content script missing");
  assert(contentScript?.world === "MAIN", "frame spoofer must run in MAIN world");
  assert(contentScript?.run_at === "document_start", "frame spoofer must run at document_start");

  const war = manifest.web_accessible_resources || [];
  const resources = war.flatMap((entry) => entry.resources || []);
  for (const required of ["css/**/*", "_locales/*/messages.json", "assets/**/*"]) {
    assert(resources.includes(required), `web_accessible_resources missing ${required}`);
  }

  const manifestText = JSON.stringify(manifest);
  const msgKeys = [...manifestText.matchAll(/__MSG_([A-Za-z0-9_]+)__/g)].map((m) => m[1]);
  assert(msgKeys.length > 0, "manifest has no localized strings");

  for (const iconPath of Object.values(manifest.action?.default_icon || {})) {
    assert(exists(iconPath), `missing action icon: ${iconPath}`);
  }
  for (const iconPath of Object.values(manifest.icons || {})) {
    assert(exists(iconPath), `missing manifest icon: ${iconPath}`);
  }
  for (const iconPath of manifest.action?.default_icon ? Object.values(manifest.action.default_icon) : []) {
    assert(exists(iconPath), `missing action icon: ${iconPath}`);
  }

  // Localized manifest keys must exist in both locales.
  for (const key of msgKeys) {
    for (const lang of ["en", "fa"]) {
      const file = `_locales/${lang}/messages.json`;
      if (exists(file)) {
        const messages = readJson(file);
        assert(messages[key]?.message, `${file} is missing manifest key ${key}`);
      }
    }
  }
}

// ---------------------------------------------------------------- locales
const localeRoot = path.join(root, "_locales");
if (!fs.existsSync(localeRoot)) {
  fail("_locales directory is missing");
} else {
  const locales = fs
    .readdirSync(localeRoot, { withFileTypes: true })
    .filter((entry) => entry.isDirectory())
    .map((entry) => entry.name)
    .sort();
  assert(JSON.stringify(locales) === JSON.stringify(["en", "fa"]), `locales must be exactly en,fa (found ${locales.join(",")})`);

  const en = readJson("_locales/en/messages.json");
  const fa = readJson("_locales/fa/messages.json");
  const enKeys = Object.keys(en).sort();
  const faKeys = Object.keys(fa).sort();
  assert(enKeys.length > 150, `English locale has too few keys: ${enKeys.length}`);
  assert(enKeys.length === faKeys.length, `locale key count differs: en=${enKeys.length} fa=${faKeys.length}`);
  const missingFa = enKeys.filter((key) => !fa[key]);
  const missingEn = faKeys.filter((key) => !en[key]);
  assert(missingFa.length === 0, `fa is missing keys: ${missingFa.slice(0, 12).join(", ")}`);
  assert(missingEn.length === 0, `en is missing keys: ${missingEn.slice(0, 12).join(", ")}`);
  for (const [lang, messages] of [["en", en], ["fa", fa]]) {
    for (const [key, value] of Object.entries(messages)) {
      assert(typeof value?.message === "string" && value.message.length > 0, `${lang} locale key ${key} has no message`);
    }
  }
  notes.push(`locale keys: en=${enKeys.length}, fa=${faKeys.length}`);
}

// ---------------------------------------------------------------- runtime
for (const file of [
  "js/background.js",
  "js/simulator.js",
  "js/spoofer.js",
  "js/frame-element-spoofer.js",
  "js/i18n.js",
  "js/check.js",
  "js/popup.js",
  "js/chunk-vendors.js",
  "js/offscreen.js",
  "css/mobot.css",
  "assets/pictos/logo.svg",
  "assets/fonts/OFL.txt",
  "fonts/icomoon.ttf",
]) {
  assert(exists(file), `required runtime file is missing: ${file}`);
}

if (exists("js/i18n.js")) {
  const i18n = read("js/i18n.js");
  for (const token of ["MobotI18n", "mobot_language", "_locales/"]) {
    assert(i18n.includes(token), `js/i18n.js is missing ${token}`);
  }
}
if (exists("js/background.js")) {
  const background = read("js/background.js");
  assert(background.includes('importScripts("/js/i18n.js")'), "background must import js/i18n.js");
  assert(background.includes("css/mobot.css"), "background must inject css/mobot.css");
  assert(background.includes("js/i18n.js"), "background must inject js/i18n.js");
  assert(background.includes("MobotI18n"), "background must use MobotI18n");
}
if (exists("js/check.js")) {
  const check = read("js/check.js");
  assert(check.includes("hasMobotExtension"), "js/check.js must expose the file:// activation marker");
}

// ---------------------------------------------------------------- HTML assets
const htmlFiles = walk(root).filter((file) => file.endsWith(".html"));
for (const file of htmlFiles) {
  const text = fs.readFileSync(file, "utf8");
  for (const match of text.matchAll(/(?:src|href)=["']([^"']+)["']/g)) {
    const value = match[1].trim();
    if (
      !value ||
      value.startsWith("#") ||
      value.startsWith("http:") ||
      value.startsWith("https:") ||
      value.startsWith("data:") ||
      value.startsWith("blob:") ||
      value.startsWith("chrome-extension:") ||
      value.startsWith("//")
    ) {
      continue;
    }
    const base = value.startsWith("/") ? root : path.dirname(file);
    const local = value.replace(/^\/+/, "").split(/[?#]/, 1)[0];
    if (local.includes("*")) continue;
    assert(fs.existsSync(path.resolve(base, local)), `${rel(file)} references missing asset: ${value}`);
  }
}

// ---------------------------------------------------------------- JavaScript syntax
const jsFiles = walk(root).filter((file) => file.endsWith(".js"));
for (const file of jsFiles) {
  try {
    execFileSync(process.execPath, ["--check", file], { stdio: "pipe" });
  } catch (error) {
    const detail = error.stderr?.toString().trim().split(/\r?\n/).slice(0, 3).join(" | ") || error.message;
    fail(`JavaScript syntax error in ${rel(file)}: ${detail}`);
  }
}
notes.push(`checked ${jsFiles.length} JavaScript files`);

// ---------------------------------------------------------------- forbidden strings
const forbidden = [
  { label: "vendor name", re: /\b(?:webmobilefirst|mobilefirst|mobile first)\b/i },
  { label: "Site Copilot hook", re: /site[_-]copilot/i },
  { label: "partner hook", re: /partenaire/i },
  { label: "Supabase", re: /supabase/i },
  { label: "PostHog", re: /posthog/i },
  { label: "Stripe", re: /\bstripe\b/i },
  { label: "Paddle", re: /\bpaddle\b/i },
  { label: "legacy pricing endpoint", re: /mobot-get-subscription-prices|invalid\.local/i },
  { label: "Pro tier flag", re: /is_pro|isProFeature|isProUser|pro-tag|\(PRO\)/ },
  { label: "billing/trial", re: /\b(?:billing|trial)\b/i },
  { label: "subscription", re: /\bsubscription\b/i },
  { label: "analytics", re: /analytics/i },
  { label: "legacy capture state", re: /webSocketClientId|upload-video-on-server|convert-video/ },
  { label: "account route", re: /account\/(?:home|login|signup)|subscription\/plans/i },
  { label: "free plan/license key", re: /\bfree plan\b|\blicense key\b/i },
  { label: "upgrade prompt", re: /\bupgrade\b/i },
  { label: "tracking parameter", re: /utm_/i },
];

const runtimeExtensions = new Set([".js", ".json", ".html", ".css", ".svg"]);
const runtimeFiles = walk(root).filter((file) => {
  const relPath = rel(file);
  if (relPath.startsWith("docs/") || relPath.startsWith("scripts/")) return false;
  if (relPath === "README.md" || relPath.endsWith(".md")) return false;
  return runtimeExtensions.has(path.extname(file).toLowerCase());
});

for (const file of runtimeFiles) {
  const text = fs.readFileSync(file, "utf8");
  if (text.includes("\u0000")) continue;
  for (const { label, re } of forbidden) {
    if (re.test(text)) {
      fail(`${rel(file)} contains forbidden ${label} (${re})`);
    }
  }
}

// ---------------------------------------------------------------- sensitive leftovers
for (const relPath of [
  "mobile-simulator.rar",
  "OPENSOURCE-CHECKLIST.md",
  "4.21.2_0",
  "js/message.js",
  "js/simulator.ts",
  "pages/permission/requestMicroPermission.ts",
  "pages/permission/requestCameraPermission.ts",
]) {
  assert(!exists(relPath), `sensitive or stale path must not be shipped: ${relPath}`);
}
const tsFiles = walk(root).filter((file) => file.endsWith(".ts"));
assert(tsFiles.length === 0, `TypeScript leftovers found: ${tsFiles.map(rel).join(", ")}`);

// ---------------------------------------------------------------- report
if (errors.length > 0) {
  console.error("Validation failed:\n");
  for (const error of errors) console.error(`  - ${error}`);
  process.exit(1);
}

console.log("Mobot validation passed");
for (const note of notes) console.log(`  - ${note}`);

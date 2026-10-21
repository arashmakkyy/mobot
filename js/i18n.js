/* Mobot runtime i18n.
 * Chrome's chrome.i18n.getMessage() follows the browser UI language and cannot
 * be switched at runtime. This small wrapper loads the extension's own
 * _locales/<lang>/messages.json files, persists the selected language, and
 * exposes a reactive state object that a Vue 2 app can observe.
 */
(function () {
  "use strict";
  if (self.MobotI18n) return;

  var SUPPORTED = ["en", "fa"];
  var DEFAULT_LANG = "en";
  var STORAGE_KEY = "mobot_language";
  var dictionaries = Object.create(null);
  var current = DEFAULT_LANG;
  var state = { version: 0 };
  var readyResolve;
  var ready = new Promise(function (resolve) { readyResolve = resolve; });

  function normalizeLang(lang) {
    if (!lang) return DEFAULT_LANG;
    var value = String(lang).toLowerCase();
    if (value.indexOf("fa") === 0) return "fa";
    if (value.indexOf("en") === 0) return "en";
    return DEFAULT_LANG;
  }

  async function loadDict(lang) {
    if (dictionaries[lang]) return;
    var url = chrome.runtime.getURL("_locales/" + lang + "/messages.json");
    var response = await fetch(url);
    if (!response.ok) throw new Error("Unable to load " + url);
    dictionaries[lang] = await response.json();
  }

  async function ensureDicts(lang) {
    try { await loadDict(lang); } catch (e) { dictionaries[lang] = dictionaries[lang] || {}; }
    if (lang !== DEFAULT_LANG) {
      try { await loadDict(DEFAULT_LANG); } catch (e) { dictionaries[DEFAULT_LANG] = dictionaries[DEFAULT_LANG] || {}; }
    }
  }

  async function readStoredLang() {
    try {
      if (typeof chrome !== "undefined" && chrome.storage && chrome.storage.local) {
        var data = await chrome.storage.local.get(STORAGE_KEY);
        return data && data[STORAGE_KEY];
      }
    } catch (e) {}
    try { return localStorage.getItem(STORAGE_KEY); } catch (e) { return null; }
  }

  async function writeStoredLang(lang) {
    try {
      if (typeof chrome !== "undefined" && chrome.storage && chrome.storage.local) {
        var data = {};
        data[STORAGE_KEY] = lang;
        await chrome.storage.local.set(data);
        return;
      }
    } catch (e) {}
    try { localStorage.setItem(STORAGE_KEY, lang); } catch (e) {}
  }

  function applyDocument(lang) {
    if (typeof document === "undefined" || !document.documentElement) return;
    try {
      var root = document.documentElement;
      root.setAttribute("lang", lang);
      root.setAttribute("dir", lang === "fa" ? "rtl" : "ltr");
      if (root.classList) root.classList.toggle("mobot-rtl", lang === "fa");
    } catch (e) {}
  }

  function getMessage(key, substitutions) {
    /* Register the reactive dependency used by Vue render functions. */
    void state.version;
    var dict = dictionaries[current] || {};
    var fallback = dictionaries[DEFAULT_LANG] || {};
    var entry = dict[key] || fallback[key];
    var message = entry && typeof entry.message === "string" ? entry.message : key;
    if (substitutions !== undefined && substitutions !== null) {
      var subs = Array.isArray(substitutions) ? substitutions : [substitutions];
      if (entry && entry.placeholders) {
        Object.keys(entry.placeholders).forEach(function (name) {
          var placeholder = entry.placeholders[name] || {};
          var content = String(placeholder.content || "");
          var match = /^\$(\d+)$/.exec(content);
          var value = match ? subs[Number(match[1]) - 1] : subs[0];
          var replacement = value === undefined || value === null ? "" : String(value);
          message = message.split("$" + name.toUpperCase() + "$").join(replacement);
          message = message.split("$" + name + "$").join(replacement);
        });
      }
      message = message.replace(/\$(\d)/g, function (_, digit) {
        var value = subs[Number(digit) - 1];
        return value === undefined || value === null ? "" : String(value);
      });
      message = message.replace(/\$\$/g, "$");
    }
    return message;
  }

  function getCurrentLanguage() {
    void state.version;
    return current;
  }

  async function adoptLanguage(lang, persist) {
    var next = normalizeLang(lang);
    await ensureDicts(next);
    var changed = next !== current;
    current = next;
    applyDocument(next);
    if (changed) state.version += 1;
    if (persist) await writeStoredLang(next);
    return next;
  }

  async function setLanguage(lang) {
    return adoptLanguage(lang, true);
  }

  async function init() {
    try {
      var stored = await readStoredLang();
      var browserLang = (typeof navigator !== "undefined" && navigator.language) || DEFAULT_LANG;
      var initial = normalizeLang(stored || browserLang);
      await ensureDicts(initial);
      current = initial;
      applyDocument(initial);
    } catch (e) {
      try { await ensureDicts(DEFAULT_LANG); } catch (ignored) {}
      current = DEFAULT_LANG;
      applyDocument(DEFAULT_LANG);
    } finally {
      readyResolve();
    }
  }

  if (typeof chrome !== "undefined" && chrome.storage && chrome.storage.onChanged) {
    chrome.storage.onChanged.addListener(function (changes, area) {
      if (area === "local" && changes && changes[STORAGE_KEY]) {
        var value = changes[STORAGE_KEY].newValue;
        if (value) adoptLanguage(value, false).catch(function () {});
      }
    });
  }

  self.MobotI18n = {
    ready: ready,
    state: state,
    supported: SUPPORTED,
    getMessage: getMessage,
    getCurrentLanguage: getCurrentLanguage,
    getUILanguage: getCurrentLanguage,
    setLanguage: setLanguage,
    applyDocument: applyDocument,
    normalizeLang: normalizeLang
  };

  init();
})();

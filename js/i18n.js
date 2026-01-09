import { safeJSONParse } from "./utils.js";

const FALLBACK_LANG = "en";

function detectLanguage() {
  const lang = navigator.language || FALLBACK_LANG;
  return lang.toLowerCase().startsWith("tr") ? "tr" : "en";
}

function readInlineJSON(id) {
  const script = document.getElementById(id);
  if (!script) {
    return null;
  }
  return safeJSONParse(script.textContent, null);
}

async function loadLanguage(lang) {
  const inline = readInlineJSON(`i18n-${lang}`);
  if (inline) {
    return inline;
  }
  try {
    const response = await fetch(`i18n/${lang}.json`);
    if (!response.ok) {
      throw new Error("fetch failed");
    }
    return await response.json();
  } catch (error) {
    return {};
  }
}

export async function createI18n(storage) {
  const saved = storage.getItem("dicedr_lang");
  const initial = saved || detectLanguage();
  const dictionaries = {
    en: await loadLanguage("en"),
    tr: await loadLanguage("tr"),
  };

  const api = {
    language: initial,
    t(key) {
      return dictionaries[api.language][key] || dictionaries.en[key] || key;
    },
    setLanguage(lang) {
      api.language = lang;
      storage.setItem("dicedr_lang", lang);
    },
    apply(root = document) {
      root.querySelectorAll("[data-i18n]").forEach((node) => {
        const key = node.getAttribute("data-i18n");
        node.textContent = api.t(key);
      });
    },
  };

  return api;
}

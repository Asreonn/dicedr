import { safeJSONParse } from "./utils.js";

const STATE_KEY = "dicedr_state";
const HISTORY_KEY = "dicedr_history";

function encodeBase64(value) {
  return btoa(unescape(encodeURIComponent(value)));
}

function decodeBase64(value) {
  try {
    return decodeURIComponent(escape(atob(value)));
  } catch (error) {
    return null;
  }
}

export function loadState(storage, fallback) {
  const raw = storage.getItem(STATE_KEY);
  if (!raw) {
    return fallback;
  }
  return { ...fallback, ...safeJSONParse(raw, fallback) };
}

export function saveState(storage, state) {
  storage.setItem(STATE_KEY, JSON.stringify(state));
}

export function loadHistory(storage) {
  const raw = storage.getItem(HISTORY_KEY);
  return safeJSONParse(raw, []);
}

export function saveHistory(storage, history) {
  storage.setItem(HISTORY_KEY, JSON.stringify(history.slice(0, 20)));
}

export function encodeShareState(state) {
  return encodeBase64(JSON.stringify(state));
}

export function decodeShareState(value) {
  const decoded = decodeBase64(value);
  if (!decoded) {
    return null;
  }
  return safeJSONParse(decoded, null);
}

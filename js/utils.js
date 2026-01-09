export function clamp(value, min, max) {
  return Math.min(Math.max(value, min), max);
}

export function parseLines(text) {
  return text
    .split(/\n/)
    .map((line) => line.trim())
    .filter(Boolean);
}

export function unique(items) {
  return Array.from(new Set(items));
}

export function shuffle(items) {
  const copy = items.slice();
  for (let i = copy.length - 1; i > 0; i -= 1) {
    const j = Math.floor(Math.random() * (i + 1));
    [copy[i], copy[j]] = [copy[j], copy[i]];
  }
  return copy;
}

export function randInt(min, max) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

export function pickN(items, count, noRepeat = false) {
  if (!noRepeat) {
    return Array.from({ length: count }, () => items[randInt(0, items.length - 1)]);
  }
  return shuffle(items).slice(0, count);
}

export function safeJSONParse(value, fallback) {
  try {
    return JSON.parse(value);
  } catch (error) {
    return fallback;
  }
}

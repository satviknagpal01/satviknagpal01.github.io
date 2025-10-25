// /src/js/storage.js
// Simple wrapper for localStorage preferences (safe)

export function savePref(key, value) {
  try { localStorage.setItem(key, JSON.stringify(value)); } catch {}
}

export function loadPref(key, fallback = null) {
  try {
    const v = localStorage.getItem(key);
    if (v === null) return fallback;
    return JSON.parse(v);
  } catch { return fallback; }
}

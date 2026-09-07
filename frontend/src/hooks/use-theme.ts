const STORAGE_KEY = "zentra-theme";

type Theme = "light" | "dark";

function readStoredTheme(): Theme {
  try {
    const v = localStorage.getItem(STORAGE_KEY);
    if (v === "light" || v === "dark") return v;
  } catch {
    // storage unavailable (private mode) — fall through
  }
  return "light";
}

function applyTheme(theme: Theme) {
  document.documentElement.classList.toggle("dark", theme === "dark");
}

export function getTheme(): Theme {
  return document.documentElement.classList.contains("dark") ? "dark" : "light";
}

export function initTheme() {
  applyTheme(readStoredTheme());
}

export function toggleTheme() {
  const next: Theme = getTheme() === "dark" ? "light" : "dark";
  try {
    localStorage.setItem(STORAGE_KEY, next);
  } catch {
    // ignore storage failures; still toggle for the session
  }
  applyTheme(next);
}

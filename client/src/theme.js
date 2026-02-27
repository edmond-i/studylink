// theme.js — simple theme utility to apply and toggle light/dark theme
export function getStoredTheme() {
  try {
    return localStorage.getItem('theme');
  } catch (e) {
    return null;
  }
}

export function applyTheme(theme) {
  const html = document.documentElement;
  if (theme === 'light') {
    html.classList.add('light');
  } else {
    html.classList.remove('light');
  }
}

export function detectAndApplyTheme() {
  const stored = getStoredTheme();
  if (stored) {
    applyTheme(stored);
    return stored;
  }

  // fallback to system preference
  const prefersLight = window.matchMedia && window.matchMedia('(prefers-color-scheme: light)').matches;
  applyTheme(prefersLight ? 'light' : 'dark');
  return prefersLight ? 'light' : 'dark';
}

export function toggleTheme() {
  const current = document.documentElement.classList.contains('light') ? 'light' : 'dark';
  const next = current === 'light' ? 'dark' : 'light';
  try {
    localStorage.setItem('theme', next);
  } catch (e) {}
  applyTheme(next);
  return next;
}

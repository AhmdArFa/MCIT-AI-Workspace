// This script runs before React hydration to prevent theme and accent flash
export const themeScript = `
(function() {
  try {
    var theme = JSON.parse(localStorage.getItem('theme-storage') || '{}').state?.theme || 'dark';
    var systemPrefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
    var effectiveTheme = theme === 'system' ? (systemPrefersDark ? 'dark' : 'light') : theme;
    
    document.documentElement.classList.remove('light', 'dark');
    document.documentElement.classList.add(effectiveTheme);
    document.documentElement.setAttribute('data-theme', effectiveTheme);

    var accent = localStorage.getItem('mcit-accent-color') || '#FFEDB9';
    document.documentElement.style.setProperty('--primary', accent);
    document.documentElement.style.setProperty('--gold', accent);
    document.documentElement.style.setProperty('--ring', accent);
  } catch (e) {
    document.documentElement.classList.add('dark');
    document.documentElement.setAttribute('data-theme', 'dark');
    document.documentElement.style.setProperty('--primary', '#FFEDB9');
    document.documentElement.style.setProperty('--gold', '#FFEDB9');
    document.documentElement.style.setProperty('--ring', '#FFEDB9');
  }

  window.addEventListener('message', function(e) {
    if (e.data && e.data.type === 'MCIT_ACCENT_CHANGE' && e.data.accent) {
      document.documentElement.style.setProperty('--primary', e.data.accent);
      document.documentElement.style.setProperty('--gold', e.data.accent);
      document.documentElement.style.setProperty('--ring', e.data.accent);
      try { localStorage.setItem('mcit-accent-color', e.data.accent); } catch(_) {}
    }
  });
})();
`
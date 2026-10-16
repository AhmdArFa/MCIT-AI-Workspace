'use client';

import { ThemeProvider as NextThemesProvider, useTheme } from 'next-themes';
import { type ReactNode, useEffect } from 'react';

function ThemeSync() {
  const { setTheme } = useTheme();

  useEffect(() => {
    // 1. Sync theme from URL search parameters on mount
    try {
      const params = new URLSearchParams(window.location.search);
      const urlTheme = params.get('theme');
      if (urlTheme === 'dark' || urlTheme === 'light') {
        setTheme(urlTheme);
      }
    } catch (_) {}

    // 2. Listen to postMessage from parent window (MCIT AI iframe)
    const handleMessage = (event: MessageEvent) => {
      if (
        event.data &&
        (event.data.type === 'MCIT_THEME_CHANGE' || event.data.type === 'THEME_CHANGE')
      ) {
        const newTheme = event.data.theme;
        if (newTheme === 'dark' || newTheme === 'light') {
          setTheme(newTheme);
        }
      }
    };

    window.addEventListener('message', handleMessage);
    return () => window.removeEventListener('message', handleMessage);
  }, [setTheme]);

  return null;
}

interface NextThemeProviderProps {
  children: ReactNode;
  forcedTheme?: 'dark' | 'light';
}

export default function NextThemeProvider({ children, forcedTheme }: NextThemeProviderProps) {
  return (
    <NextThemesProvider
      disableTransitionOnChange
      enableSystem
      attribute="data-theme"
      defaultTheme="system"
      forcedTheme={forcedTheme}
    >
      <ThemeSync />
      {children}
    </NextThemesProvider>
  );
}

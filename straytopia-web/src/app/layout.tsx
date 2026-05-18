import type { Metadata } from 'next';
import { THEME_STORAGE_KEY } from '@/lib/theme';
import './globals.css';

const themeInitScript = `(() => {
  try {
    const stored = window.localStorage.getItem('${THEME_STORAGE_KEY}');
    const mode = stored === 'light' || stored === 'dark' || stored === 'system' ? stored : 'system';
    const systemDark = typeof window.matchMedia === 'function' && window.matchMedia('(prefers-color-scheme: dark)').matches;
    const dark = mode === 'dark' || (mode === 'system' && systemDark);
    document.documentElement.classList.toggle('dark', dark);
    document.documentElement.style.colorScheme = dark ? 'dark' : 'light';
  } catch {}
})();`;

export const metadata: Metadata = {
  title: 'Straytopia - Protect Street Animals',
  description: 'A citizen app for protecting street animals. Feed, report, and rescue.',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link href="https://fonts.googleapis.com/css2?family=Fredoka:wght@400;500;600;700&family=Nunito:wght@400;500;600;700;800;900&family=JetBrains+Mono:wght@400;500;700&display=swap" rel="stylesheet" />
        <script dangerouslySetInnerHTML={{ __html: themeInitScript }} />
      </head>
      <body style={{ margin: 0, padding: 0 }}>{children}</body>
    </html>
  );
}

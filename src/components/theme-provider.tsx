// "use client";

// import * as React from "react";
// import { ThemeProvider as NextThemesProvider } from "next-themes";

// export function ThemeProvider({ children }: { children: React.ReactNode }) {
//   return (
//     <NextThemesProvider
//       attribute="class"
//       defaultTheme="dark"
//       enableSystem={false}
//       disableTransitionOnChange
//     >
//       {children}
//     </NextThemesProvider>
//   );
// }

"use client";

/**
 * ThemeProvider — wraps the app in next-themes context.
 *
 * Dark mode is the primary (and only supported) theme for Aura.
 * `enableSystem` is false — we don't want the OS light theme overriding
 * the glass-dark aesthetic.
 *
 * `disableTransitionOnChange` is intentionally NOT set so that the
 * colour scheme switch (if ever exposed) gets a smooth CSS transition
 * rather than a jarring flash.
 *
 * `storageKey` is namespaced to "aura-theme" to avoid collisions with
 * other apps sharing the same origin in development.
 */

import * as React from "react";
import { ThemeProvider as NextThemesProvider } from "next-themes";

interface ThemeProviderProps {
  children: React.ReactNode;
}

export function ThemeProvider({ children }: ThemeProviderProps) {
  return (
    <NextThemesProvider
      attribute="class"
      defaultTheme="dark"
      forcedTheme="dark"   // Lock to dark — Aura is dark-only
      enableSystem={false}
      storageKey="aura-theme"
      // DO NOT set disableTransitionOnChange — keep CSS transitions active
    >
      {children}
    </NextThemesProvider>
  );
}
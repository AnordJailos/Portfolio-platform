"use client";
import * as React from "react";
import { ThemeProvider as NextThemesProvider } from "next-themes";

/**
 * Dark-mode-first, per the design brief. A light theme class exists in
 * globals.css for accessibility (some visitors override OS-level dark mode
 * for readability reasons) but the site opens in dark unless the visitor's
 * system explicitly prefers light AND they haven't chosen otherwise before.
 */
export function ThemeProvider({ children }: { children: React.ReactNode }) {
  return (
    <NextThemesProvider attribute="class" defaultTheme="dark" enableSystem={false} disableTransitionOnChange>
      {children}
    </NextThemesProvider>
  );
}

"use client";
import { Toaster as Sonner } from "sonner";

/** Thin wrapper around `sonner`, themed to match the Signal design tokens. Mounted once in app/layout.tsx. */
export function Toaster() {
  return (
    <Sonner
      theme="dark"
      position="bottom-right"
      toastOptions={{
        style: {
          background: "#1B1E27",
          border: "1px solid rgba(255,255,255,0.09)",
          color: "#F4F3F1",
        },
      }}
    />
  );
}

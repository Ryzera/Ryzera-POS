"use client";

import type { ReactNode } from "react";
import "./globals.css";

// Temporary fonts using system defaults
const geistSansClass = "font-sans"; // replace with your tailwind/system font
const geistMonoClass = "font-mono";

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="en">
      <body className={`${geistSansClass} ${geistMonoClass}`}>
        {children}
      </body>
    </html>
  );
}

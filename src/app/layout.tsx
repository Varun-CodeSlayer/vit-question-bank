/* this is layout.tsx file */
import type { Metadata } from "next";
import { Inter, JetBrains_Mono } from "next/font/google";
import "./globals.css";

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
  display: "swap",
});

const jetbrainsMono = JetBrains_Mono({
  variable: "--font-jetbrains-mono",
  subsets: ["latin"],
  display: "swap",
});

export const metadata: Metadata = {
  title: "[SITE NAME] – Practice Smarter, Topic by Topic",
  description: "Module-wise and topic-wise previous-year questions, built for your campus.",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html
      lang="en"
      data-theme="light"
      className={`${inter.variable} ${jetbrainsMono.variable} antialiased`}
    >
      <body>
        <svg width="0" height="0" style={{ position: "absolute" }} aria-hidden="true">
          <defs>
            <symbol id="search" viewBox="0 0 24 24"><circle cx="11" cy="11" r="8" /><path d="m21 21-4.3-4.3" /></symbol>
            <symbol id="mic" viewBox="0 0 24 24"><path d="M12 2a3 3 0 0 0-3 3v7a3 3 0 0 0 6 0V5a3 3 0 0 0-3-3Z" /><path d="M19 10v2a7 7 0 0 1-14 0v-2M12 19v3" /></symbol>
            <symbol id="book" viewBox="0 0 24 24"><path d="M2 3h6a4 4 0 0 1 4 4v14a3 3 0 0 0-3-3H2zM22 3h-6a4 4 0 0 0-4 4v14a3 3 0 0 1 3-3h7z" /></symbol>
            <symbol id="dl" viewBox="0 0 24 24"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4M7 10l5 5 5-5M12 15V3" /></symbol>
            <symbol id="checks" viewBox="0 0 24 24"><path d="m3 17 2 2 4-4M3 7l2 2 4-4M13 6h8M13 12h8M13 18h8" /></symbol>
            <symbol id="ne" viewBox="0 0 24 24"><path d="M7 7h10v10M7 17 17 7" /></symbol>
            <symbol id="up" viewBox="0 0 24 24"><path d="m5 12 7-7 7 7M12 19V5" /></symbol>
            <symbol id="home" viewBox="0 0 24 24"><path d="M15 21v-8a1 1 0 0 0-1-1h-4a1 1 0 0 0-1 1v8" /><path d="M3 10a2 2 0 0 1 .7-1.5l7-6a2 2 0 0 1 2.6 0l7 6A2 2 0 0 1 21 10v9a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" /></symbol>
            <symbol id="file" viewBox="0 0 24 24"><path d="M20 7h-3a2 2 0 0 1-2-2V2" /><path d="M9 18a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h7l4 4v10a2 2 0 0 1-2 2Z" /><path d="M3 7.6v12.8A1.6 1.6 0 0 0 4.6 22h9.8" /></symbol>
            <symbol id="marked" viewBox="0 0 24 24"><path d="M4 19.5v-15A2.5 2.5 0 0 1 6.5 2H20v20H6.5a2.5 2.5 0 0 1 0-5H20" /><polyline points="10 2 10 10 13 7 16 10 16 2" /></symbol>
            <symbol id="cap" viewBox="0 0 24 24"><path d="M21.4 10.9a1 1 0 0 0 0-1.8L12.8 5.2a2 2 0 0 0-1.7 0L2.6 9.1a1 1 0 0 0 0 1.8l8.6 3.9a2 2 0 0 0 1.7 0zM22 10v6M6 12.5V16a6 3 0 0 0 12 0v-3.5" /></symbol>
            <symbol id="filter" viewBox="0 0 24 24"><path d="M22 3H2l8 9.5V19l4 2v-8.5z" /></symbol>
            <symbol id="plus" viewBox="0 0 24 24"><path d="M12 5v14M5 12h14" /></symbol>
            <symbol id="target" viewBox="0 0 24 24"><circle cx="12" cy="12" r="10" /><circle cx="12" cy="12" r="6" /><circle cx="12" cy="12" r="2" /></symbol>
            <symbol id="pin" viewBox="0 0 24 24"><path d="M20 10c0 6-8 12-8 12S4 16 4 10a8 8 0 0 1 16 0z" /><circle cx="12" cy="10" r="3" /></symbol>
            <symbol id="ig" viewBox="0 0 24 24"><rect x="2" y="2" width="20" height="20" rx="5" /><circle cx="12" cy="12" r="4" /><path d="M17.5 6.5h.01" /></symbol>
            <symbol id="in" viewBox="0 0 24 24"><path d="M16 8a6 6 0 0 1 6 6v7h-4v-7a2 2 0 0 0-4 0v7h-4v-7a6 6 0 0 1 6-6zM2 9h4v12H2z" /><circle cx="4" cy="4" r="2" /></symbol>
            <symbol id="gh" viewBox="0 0 24 24"><path d="M15 22v-4a4.8 4.8 0 0 0-1-3.5c3 0 6-2 6-5.5.1-1.3-.2-2.6-1-3.8.3-1.1.3-2.3 0-3.5 0 0-1 0-3 1.5a13.4 13.4 0 0 0-7 0C6 2 5 2 5 2c-.3 1.200-.3 2.400 0 3.500A5.400 5.400 0 0 0 4 9c0 3.500 3 5.500 6 5.500-.4.500-.8 1.300-.9 2.500V22M9 18c-4.500 2-5-2-7-2" /></symbol>
            <symbol id="globe" viewBox="0 0 24 24"><circle cx="12" cy="12" r="10" /><path d="M2 12h20M12 2a15 15 0 0 1 0 20 15 15 0 0 1 0-20" /></symbol>
            <symbol id="tree" viewBox="0 0 24 24"><path d="M21 12h-8M21 6H8M21 18h-8M3 6v4c0 1.1.9 2 2 2h3M3 10v6c0 1.1.9 2 2 2h3" /></symbol>
            <symbol id="map" viewBox="0 0 24 24"><path d="M14.1 5.55a2 2 0 0 0 1.8 0l3.66-1.83A1 1 0 0 1 21 4.62v12.76a1 1 0 0 1-.55.9l-4.55 2.28a2 2 0 0 1-1.79 0l-4.2-2.1a2 2 0 0 0-1.79 0l-3.66 1.83A1 1 0 0 1 3 19.38V6.62a1 1 0 0 1 .55-.9l4.55-2.28a2 2 0 0 1 1.79 0zM15 5.76v15M9 3.24v15" /></symbol>
            <symbol id="route" viewBox="0 0 24 24"><circle cx="6" cy="19" r="3" /><path d="M9 19h8.5a3.5 3.5 0 0 0 0-7h-11a3.5 3.5 0 0 1 0-7H15" /><circle cx="18" cy="5" r="3" /></symbol>
            <symbol id="sliders" viewBox="0 0 24 24"><path d="M10 5H3M12 19H3M14 3v4M16 17v4M21 12h-9M21 19h-5M21 5h-7M8 10v4M8 12H3" /></symbol>
            <symbol id="brain" viewBox="0 0 24 24"><path d="M12 18V5M15 13a4.17 4.17 0 0 1-3-4 4.17 4.17 0 0 1-3 4M17.6 6.5A3 3 0 1 0 12 5a3 3 0 1 0-5.6 1.5M18 5.13a4 4 0 0 1 2.52 5.77M18 18a4 4 0 0 0 2-7.46M19.97 17.48A4 4 0 1 1 12 18a4 4 0 1 1-7.97-.52M6 18a4 4 0 0 1-2-7.46M6 5.13a4 4 0 0 0-2.52 5.77" /></symbol>
            <symbol id="layers" viewBox="0 0 24 24"><path d="M12.83 2.18a2 2 0 0 0-1.66 0L2.6 6.08a1 1 0 0 0 0 1.83l8.58 3.91a2 2 0 0 0 1.66 0l8.58-3.9a1 1 0 0 0 0-1.83zM2 12a1 1 0 0 0 .58.91l8.6 3.91a2 2 0 0 0 1.65 0l8.58-3.9A1 1 0 0 0 22 12M2 17a1 1 0 0 0 .58.91l8.6 3.91a2 2 0 0 0 1.65 0l8.58-3.9A1 1 0 0 0 22 17" /></symbol>
            <symbol id="heart" viewBox="0 0 24 24"><path fill="currentColor" stroke="none" d="M12 21s-8-5.2-8-11a4.5 4.5 0 0 1 8-2.8A4.5 4.5 0 0 1 20 10c0 5.800-8 11-8 11z" /></symbol>
          </defs>
        </svg>
        {children}
      </body>
    </html>
  );
}

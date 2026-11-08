"use client";

import React, { useEffect, useState } from "react";
import Image from "next/image";

export interface ThemedLogoProps {
  width?: number;
  height?: number;
  className?: string;
  priority?: boolean;
  alt?: string;
}

export default function ThemedLogo({
  width = 153,
  height = 30,
  className = "brand-logo-img",
  priority = false,
  alt = "PrepNinja",
}: ThemedLogoProps) {
  const [theme, setTheme] = useState<"light" | "dark">(() => {
    if (typeof document === "undefined") return "light";
    const docTheme = document.documentElement.dataset.theme;
    if (docTheme === "dark" || docTheme === "light") return docTheme;
    const saved = typeof localStorage !== "undefined" ? localStorage.getItem("theme") : null;
    if (saved === "dark" || saved === "light") return saved;
    return typeof window !== "undefined" && window.matchMedia("(prefers-color-scheme: dark)").matches
      ? "dark"
      : "light";
  });

  useEffect(() => {
    const getTheme = (): "light" | "dark" => {
      if (typeof document === "undefined") return "light";
      const docTheme = document.documentElement.dataset.theme;
      if (docTheme === "dark" || docTheme === "light") return docTheme;
      const saved = localStorage.getItem("theme");
      if (saved === "dark" || saved === "light") return saved;
      return window.matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light";
    };

    if (!document.documentElement.dataset.theme) {
      document.documentElement.dataset.theme = getTheme();
    }

    // Listen for attribute mutations on <html>
    const observer = new MutationObserver(() => {
      setTheme(getTheme());
    });

    observer.observe(document.documentElement, {
      attributes: true,
      attributeFilter: ["data-theme"],
    });

    const handleThemeChange = (e: Event) => {
      const customEvent = e as CustomEvent<"light" | "dark">;
      if (customEvent.detail) {
        setTheme(customEvent.detail);
      } else {
        setTheme(getTheme());
      }
    };

    window.addEventListener("themechange", handleThemeChange);
    window.addEventListener("storage", handleThemeChange);

    return () => {
      observer.disconnect();
      window.removeEventListener("themechange", handleThemeChange);
      window.removeEventListener("storage", handleThemeChange);
    };
  }, []);

  const isDark = theme === "dark";

  return (
    <Image
      key={isDark ? "dark" : "light"}
      src={isDark ? "/prepninja-dark-mode.png" : "/prepninja-light-mode.png"}
      alt={alt}
      width={width}
      height={height}
      className={className}
      priority={priority}
    />
  );
}

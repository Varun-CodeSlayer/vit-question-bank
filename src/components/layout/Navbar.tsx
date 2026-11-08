/* this is navbar.tsx */
"use client";

import React, { useEffect, useState, useRef } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import ThemedLogo from "@/components/ui/ThemedLogo";

export interface NavbarProps {
  theme?: "light" | "dark";
  onToggleTheme?: () => void;
}

export default function Navbar({
  theme: externalTheme,
  onToggleTheme,
}: NavbarProps = {}) {
  const [internalTheme, setInternalTheme] = useState<"light" | "dark">(() => {
    if (typeof document === "undefined") return "light";
    const savedTheme = (typeof window !== "undefined" && localStorage.getItem("theme")) as
      | "light"
      | "dark"
      | null;
    return savedTheme || (document.documentElement.dataset.theme === "dark" ? "dark" : "light");
  });
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const pathname = usePathname();
  const navRef = useRef<HTMLElement>(null);

  useEffect(() => {
    const savedTheme = (typeof window !== "undefined" && localStorage.getItem("theme")) as
      | "light"
      | "dark"
      | null;
    const targetTheme = savedTheme || (document.documentElement.dataset.theme === "dark" ? "dark" : "light");
    if (!document.documentElement.dataset.theme) {
      document.documentElement.dataset.theme = targetTheme;
    }
  }, []);

  const [prevPathname, setPrevPathname] = useState(pathname);
  if (prevPathname !== pathname) {
    setPrevPathname(pathname);
    setIsMenuOpen(false);
  }

  // Handle outside click, escape key, and resize when menu is open
  useEffect(() => {
    if (!isMenuOpen) return;

    const handleClickOutside = (e: MouseEvent) => {
      if (navRef.current && !navRef.current.contains(e.target as Node)) {
        setIsMenuOpen(false);
      }
    };

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        setIsMenuOpen(false);
      }
    };

    const handleResize = () => {
      if (window.innerWidth > 820) {
        setIsMenuOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    document.addEventListener("keydown", handleKeyDown);
    window.addEventListener("resize", handleResize);

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
      document.removeEventListener("keydown", handleKeyDown);
      window.removeEventListener("resize", handleResize);
    };
  }, [isMenuOpen]);

  const currentTheme = externalTheme ?? internalTheme;

  const toggleTheme = () => {
    if (onToggleTheme) {
      onToggleTheme();
    } else {
      const nextTheme = currentTheme === "dark" ? "light" : "dark";
      setInternalTheme(nextTheme);
      document.documentElement.dataset.theme = nextTheme;
      if (typeof window !== "undefined") {
        localStorage.setItem("theme", nextTheme);
        window.dispatchEvent(new CustomEvent("themechange", { detail: nextTheme }));
      }
    }
  };

  const isHome = pathname === "/" || pathname === "";
  const isPractice = pathname === "/practice" || pathname.startsWith("/practice/");
  const isPapers = pathname === "/papers" || pathname.startsWith("/papers/");
  const isSyllabus = pathname === "/syllabus" || pathname.startsWith("/syllabus/");

  return (
    <header className="nav" ref={navRef}>
      <Link className="brand" href={isHome ? "#top" : "/"}>
        <ThemedLogo width={153} height={30} priority />
      </Link>
      <nav className="links" aria-label="Primary">
        <Link
          className={isHome ? "on" : ""}
          href={isHome ? "#top" : "/"}
          aria-current={isHome ? "page" : undefined}
        >
          <svg className="i">
            <use href="#home" />
          </svg>
          Home
        </Link>
        <Link
          className={isPractice ? "on" : ""}
          href="/practice"
          aria-current={isPractice ? "page" : undefined}
        >
          <svg className="i">
            <use href="#book" />
          </svg>
          Practice Questions
        </Link>
        <Link
          className={isPapers ? "on" : ""}
          href="/papers"
          aria-current={isPapers ? "page" : undefined}
        >
          <svg className="i">
            <use href="#file" />
          </svg>
          Papers
        </Link>
        <Link
          className={isSyllabus ? "on" : ""}
          href="/syllabus"
          aria-current={isSyllabus ? "page" : undefined}
        >
          <svg className="i">
            <use href="#marked" />
          </svg>
          Syllabus
        </Link>
      </nav>
      <div className="ctrl">
        <button
          className="toggle"
          id="theme"
          role="switch"
          aria-checked={currentTheme === "dark"}
          aria-label={`Switch to ${currentTheme === "dark" ? "light" : "dark"} mode`}
          onClick={toggleTheme}
        >
          <span className="rings"></span>
          <svg className="clouds" viewBox="0 0 64 32" aria-hidden="true">
            <path
              fill="#b9dcf2"
              d="M34 32c0-3 2.500-5 5-4.200 1-3.300 5.500-4.800 8-2.200 2.300-2.500 6.500-2 7.800 1 2.500-.3 5 1.500 5.200 4.200V32z"
            />
            <path
              fill="#effaff"
              d="M26 32c0-3.500 3-6 6.500-5 1.500-4 7-5.500 10-2.200 2.500-3 8-2.500 9.500 1.200 3.500-.5 6 1.500 6.500 6z"
            />
          </svg>
          <svg className="stars" viewBox="0 0 64 32" fill="#fff" aria-hidden="true">
            <path
              transform="translate(9 9) scale(1.1)"
              d="M0-3 .8-.8 3 0 .8 .8 0 3-.8 .8-3 0-.8-.8z"
            />
            <path
              transform="translate(17 6) scale(0.8)"
              d="M0-3 .8-.8 3 0 .8 .8 0 3-.8 .8-3 0-.8-.8z"
            />
            <path
              transform="translate(7 21) scale(0.9)"
              d="M0-3 .8-.8 3 0 .8 .8 0 3-.8 .8-3 0-.8-.8z"
            />
            <path
              transform="translate(15 25) scale(1)"
              d="M0-3 .8-.8 3 0 .8 .8 0 3-.8 .8-3 0-.8-.8z"
            />
            <path
              transform="translate(22 15) scale(0.6)"
              d="M0-3 .8-.8 3 0 .8 .8 0 3-.8 .8-3 0-.8-.8z"
            />
            <path
              transform="translate(24 27) scale(0.5)"
              d="M0-3 .8-.8 3 0 .8 .8 0 3-.8 .8-3 0-.8-.8z"
            />
            <path
              transform="translate(27 7) scale(0.5)"
              d="M0-3 .8-.8 3 0 .8 .8 0 3-.8 .8-3 0-.8-.8z"
            />
            <circle cx="4" cy="14" r=".6" />
            <circle cx="12" cy="17" r=".5" />
            <circle cx="20" cy="22" r=".5" />
          </svg>
          <span className="knob">
            <i className="sun"></i>
            <i className="moon"></i>
          </span>
        </button>
        <button
          className="menu-btn"
          type="button"
          aria-label={isMenuOpen ? "Close menu" : "Open menu"}
          aria-expanded={isMenuOpen}
          aria-controls="mobile-nav-menu"
          onClick={() => setIsMenuOpen((prev) => !prev)}
        >
          {isMenuOpen ? (
            <svg
              width="22"
              height="22"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2.2"
              strokeLinecap="round"
              strokeLinejoin="round"
              aria-hidden="true"
            >
              <line x1="18" y1="6" x2="6" y2="18" />
              <line x1="6" y1="6" x2="18" y2="18" />
            </svg>
          ) : (
            <svg
              width="22"
              height="22"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2.2"
              strokeLinecap="round"
              strokeLinejoin="round"
              aria-hidden="true"
            >
              <line x1="4" y1="6" x2="20" y2="6" />
              <line x1="4" y1="12" x2="20" y2="12" />
              <line x1="4" y1="18" x2="20" y2="18" />
            </svg>
          )}
        </button>
      </div>

      {isMenuOpen && (
        <nav
          className="mobile-menu"
          id="mobile-nav-menu"
          aria-label="Mobile Navigation"
        >
          <Link
            className={isHome ? "on" : ""}
            href={isHome ? "#top" : "/"}
            aria-current={isHome ? "page" : undefined}
            onClick={() => setIsMenuOpen(false)}
          >
            <svg className="i">
              <use href="#home" />
            </svg>
            Home
          </Link>
          <Link
            className={isPractice ? "on" : ""}
            href="/practice"
            aria-current={isPractice ? "page" : undefined}
            onClick={() => setIsMenuOpen(false)}
          >
            <svg className="i">
              <use href="#book" />
            </svg>
            Practice Questions
          </Link>
          <Link
            className={isPapers ? "on" : ""}
            href="/papers"
            aria-current={isPapers ? "page" : undefined}
            onClick={() => setIsMenuOpen(false)}
          >
            <svg className="i">
              <use href="#file" />
            </svg>
            Papers
          </Link>
          <Link
            className={isSyllabus ? "on" : ""}
            href="/syllabus"
            aria-current={isSyllabus ? "page" : undefined}
            onClick={() => setIsMenuOpen(false)}
          >
            <svg className="i">
              <use href="#marked" />
            </svg>
            Syllabus
          </Link>
        </nav>
      )}
    </header>
  );
}
export { Navbar };
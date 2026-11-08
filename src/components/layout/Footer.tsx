/* this is footer.tsx */
"use client";

import React, { useEffect, useRef } from "react";
import Link from "next/link";
import ThemedLogo from "@/components/ui/ThemedLogo";

export interface FooterProps {
  showCreator?: boolean;
}

export default function Footer({ showCreator = true }: FooterProps) {
  const containerRef = useRef<HTMLElement>(null);

  useEffect(() => {
    if (!containerRef.current) return;
    const rvElements = containerRef.current.querySelectorAll(".rv");
    if (!rvElements.length) return;

    if (typeof IntersectionObserver === "undefined") {
      rvElements.forEach((el) => el.classList.add("in"));
      return;
    }

    const io = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add("in");
            io.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.15 }
    );

    rvElements.forEach((el) => io.observe(el));

    return () => {
      io.disconnect();
    };
  }, [showCreator]);

  const footerElement = (
    <footer>
      <div className="fr">
        <div className="credit">
          <span className="mini">
            <span className="ph" role="img" aria-label="Photo of Varun"></span>
          </span>
          Made by Varun
        </div>
        <div className="mid">
          <div className="brand">
            <ThemedLogo width={122} height={24} />
          </div>
          <div className="fl">
            <Link href="/privacy">Privacy</Link>
            <s>|</s>
            <Link href="/terms">Terms</Link>
            <s>|</s>
            <a href="#">Contact</a>
            <s>|</s>
            <a
              href="https://forms.gle/ARB8oVTAN8XgAju17"
              target="_blank"
              rel="noopener noreferrer"
            >
              Report an Issue
            </a>
          </div>
        </div>
        <div className="conn">
          <a
            className="sb s"
            href="#top"
            data-tip="Back to top"
            aria-label="Back to top"
          >
            <span className="c"></span>
            <svg className="i">
              <use href="#up" />
            </svg>
          </a>
        </div>
      </div>
      <p className="copy">
        (c) 2026 PrepNinja. Not affiliated with VIT. Question papers belong to their respective owners.
      </p>
    </footer>
  );

  if (!showCreator) {
    return footerElement;
  }

  return (
    <section className="made" ref={containerRef}>
      <div className="cs">
        <div className="rule rv">
          <h2>
            Made With{" "}
            <svg className="heart">
              <use href="#heart" />
            </svg>
          </h2>
        </div>
        <div className="cc2 rv">
          <div className="por">
            <span className="ph" role="img" aria-label="Photo of Varun"></span>
          </div>
          <div>
            <h3 className="grad">Varun</h3>
            <p className="r">Student Developer</p>
            <p style={{ fontSize: "16px" }}>VIT Chennai</p>
            <p>Built by a student, for students.</p>
            <div className="soc">
              Find me on
              <a
                className="sb"
                href="https://www.instagram.com/mostly_average_boi/"
                target="_blank"
                rel="noopener noreferrer"
                data-tip="Instagram"
                aria-label="Instagram"
              >
                <span className="c"></span>
                <svg className="i">
                  <use href="#ig" />
                </svg>
              </a>
              <a
                className="sb"
                href="https://www.linkedin.com/in/varun-s-801a59301/"
                target="_blank"
                rel="noopener noreferrer"
                data-tip="LinkedIn"
                aria-label="LinkedIn"
              >
                <span className="c"></span>
                <svg className="i">
                  <use href="#in" />
                </svg>
              </a>
              <a
                className="sb"
                href="https://github.com/Varun-CodeSlayer"
                target="_blank"
                rel="noopener noreferrer"
                data-tip="GitHub"
                aria-label="GitHub"
              >
                <span className="c"></span>
                <svg className="i">
                  <use href="#gh" />
                </svg>
              </a>
              <a
                className="sb"
                href="https://student-portfolio-varun.vercel.app/#contact"
                target="_blank"
                rel="noopener noreferrer"
                data-tip="Portfolio"
                aria-label="Portfolio"
              >
                <span className="c"></span>
                <svg className="i">
                  <use href="#globe" />
                </svg>
              </a>
            </div>
          </div>
        </div>
      </div>
      {footerElement}
    </section>
  );
}

export { Footer };

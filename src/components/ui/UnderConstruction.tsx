"use client";

import React, { Suspense } from "react";
import Link from "next/link";
import Image from "next/image";
import { useSearchParams } from "next/navigation";
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";

export interface UnderConstructionProps {
  pageTitle: string;
  pageDescription?: string;
  badgeLabel?: string;
  courseCode?: string;
}

function UnderConstructionContent({
  pageTitle,
  pageDescription,
  badgeLabel = "Coming Soon",
  courseCode: propCourseCode,
}: UnderConstructionProps) {
  const searchParams = useSearchParams();
  const queryCourse = searchParams?.get("course") || "";
  const effectiveCode = (queryCourse || propCourseCode || "").trim().toUpperCase();

  const titleText = effectiveCode
    ? `${pageTitle} for ${effectiveCode}`
    : pageTitle;

  const defaultDesc = effectiveCode
    ? `We are actively preparing ${pageTitle.toLowerCase()} resources for ${effectiveCode}. You can already practice ${effectiveCode} questions topic-by-topic on our Practice page!`
    : "We're actively preparing this section with high-quality study materials, past exam papers, and syllabus resources. Check back soon!";

  const practiceUrl = effectiveCode ? `/practice/${effectiveCode}` : "/practice";
  const practiceLabel = effectiveCode
    ? `Practice ${effectiveCode} Questions`
    : "Practice Questions";
  const practiceSub = effectiveCode
    ? `Explore syllabus & topic-wise questions`
    : "Topic-wise & module-wise practice";

  return (
    <div className="construction-page">
      <Navbar />

      <main className="construction-wrap">
        {/* Breadcrumb Navigation */}
        <nav className="construction-crumbs" aria-label="Breadcrumb">
          <Link href="/">Home</Link>
          <span className="crumb-sep">/</span>
          {effectiveCode ? (
            <>
              <Link
                href={
                  pageTitle.toLowerCase().includes("paper")
                    ? "/papers"
                    : "/syllabus"
                }
              >
                {pageTitle}
              </Link>
              <span className="crumb-sep">/</span>
              <span aria-current="page">{effectiveCode}</span>
            </>
          ) : (
            <span aria-current="page">{pageTitle}</span>
          )}
        </nav>

        {/* Content Box */}
        <section className="construction-card">
          {/* Hyperlinked Image directing to Home */}
          <Link
            href="/"
            className="construction-img-link"
            title="Click to return to Home"
            aria-label={`${titleText} is under construction - Click to return to Home`}
          >
            <div className="construction-img-wrap">
              <Image
                src="/assets/under-construction.png"
                alt={`${titleText} is under construction - Click to return to Home`}
                width={560}
                height={370}
                priority
                className="construction-img"
              />
            </div>
          </Link>

          {/* Badge */}
          <div className="construction-badge">
            <span className="pulse-dot"></span>
            <span>{effectiveCode ? `${effectiveCode} · ${badgeLabel}` : badgeLabel}</span>
          </div>

          {/* Heading */}
          <h1 className="construction-title">
            <span>{titleText} is</span>{" "}
            <span className="grad">Under Construction</span>
          </h1>

          {/* Description */}
          <p className="construction-desc">
            {pageDescription || defaultDesc}
          </p>

          {/* Action Boxes */}
          <div className="construction-actions">
            {/* Primary: Back to Home Box */}
            <Link
              href="/"
              className="back-home-box"
              aria-label="Back to Home"
            >
              <span className="home-icon-circle">
                <svg className="i" style={{ fontSize: "20px" }}>
                  <use href="#home" />
                </svg>
              </span>
              <span className="home-box-text">
                <strong>Back to Home</strong>
                <small>Return to main question-bank hub</small>
              </span>
              <svg className="i arrow-ic" style={{ fontSize: "16px" }}>
                <use href="#ne" />
              </svg>
            </Link>

            {/* Secondary: Practice Questions Box (adapted to course if selected) */}
            <Link
              href={practiceUrl}
              className="browse-practice-box"
              aria-label={practiceLabel}
            >
              <span className="practice-icon-circle">
                <svg className="i" style={{ fontSize: "20px" }}>
                  <use href="#book" />
                </svg>
              </span>
              <span className="home-box-text">
                <strong>{practiceLabel}</strong>
                <small>{practiceSub}</small>
              </span>
              <svg className="i arrow-ic" style={{ fontSize: "16px" }}>
                <use href="#ne" />
              </svg>
            </Link>
          </div>
        </section>
      </main>

      <Footer showCreator={false} />
    </div>
  );
}

export default function UnderConstruction(props: UnderConstructionProps) {
  return (
    <Suspense fallback={null}>
      <UnderConstructionContent {...props} />
    </Suspense>
  );
}

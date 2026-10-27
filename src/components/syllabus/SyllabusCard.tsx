"use client";

import React from "react";
import Link from "next/link";
import { SyllabusItem } from "@/lib/syllabus-service";

export interface SyllabusCardProps {
  syllabus: SyllabusItem;
  returnQueryString?: string;
  onUnavailableClick?: (syllabus: SyllabusItem) => void;
}

export default function SyllabusCard({
  syllabus,
  returnQueryString = "",
}: SyllabusCardProps) {
  const viewUrl = `/syllabus/${encodeURIComponent(syllabus.courseCode)}${returnQueryString}`;
  const hasSyllabus = syllabus.hasSyllabus;

  return (
    <div className="paper-card syllabus-card" id={`syllabus-${syllabus.courseCode}`}>
      {/* Header with Course Code and Availability Status */}
      <div className="paper-card__header">
        <div className="paper-card__tags">
          <span className="paper-card__code">{syllabus.courseCode}</span>
          {hasSyllabus ? (
            <span className="paper-card__status-badge available" title="Official syllabus PDF available">
              <svg
                className="i"
                viewBox="0 0 24 24"
                aria-hidden="true"
                width="12"
                height="12"
                fill="none"
                stroke="currentColor"
                strokeWidth="2.5"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <polyline points="20 6 9 17 4 12" />
              </svg>
              <span>Syllabus Available</span>
            </span>
          ) : (
            <span className="paper-card__status-badge pending" title="Syllabus PDF pending upload">
              <svg
                className="i"
                viewBox="0 0 24 24"
                aria-hidden="true"
                width="13"
                height="13"
                fill="none"
                stroke="currentColor"
                strokeWidth="2.2"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <circle cx="12" cy="12" r="10" />
                <line x1="12" y1="8" x2="12" y2="12" />
                <line x1="12" y1="16" x2="12.01" y2="16" />
              </svg>
              <span>Syllabus Pending</span>
            </span>
          )}
        </div>
      </div>

      {/* Course Title and Curriculum / Campus Details */}
      <div className="paper-card__body">
        {hasSyllabus ? (
          <Link href={viewUrl} className="paper-card__title-link">
            <h3 className="paper-card__title" title={syllabus.courseName}>
              {syllabus.courseName}
            </h3>
          </Link>
        ) : (
          <h3
            className="paper-card__title"
            style={{ cursor: "default" }}
            title={`${syllabus.courseName} (Syllabus PDF pending)`}
          >
            {syllabus.courseName}
          </h3>
        )}

        <div className="paper-card__meta">
          <div className="paper-card__meta-item" title="Academic Curriculum">
            <svg
              className="i"
              aria-hidden="true"
              viewBox="0 0 24 24"
              width="15"
              height="15"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5" />
            </svg>
            <span>ACE Curriculum</span>
          </div>

          <span className="paper-card__meta-sep" aria-hidden="true">|</span>

          <div className="paper-card__meta-item" title="Campus">
            <svg
              className="i"
              aria-hidden="true"
              viewBox="0 0 24 24"
              width="15"
              height="15"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <path d="M3 21h18M3 10h18M5 6l7-3 7 3M4 10v11m16-11v11M8 14v3m4-3v3m4-3v3" />
            </svg>
            <span>{syllabus.courseId.startsWith("VITC") ? "VIT Chennai" : "VIT"}</span>
          </div>
        </div>
      </div>

      {/* Action Area: View Syllabus (Available) OR "Oops sorry!!! Syllabus Unavailable..." Box with Contribute Box */}
      <div className="paper-card__actions">
        {hasSyllabus ? (
          <>
            <Link href={viewUrl} className="paper-btn paper-btn--primary">
              <svg className="i" aria-hidden="true" viewBox="0 0 24 24">
                <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
                <circle cx="12" cy="12" r="3" />
              </svg>
              <span>View Syllabus</span>
            </Link>

            {syllabus.viewUrl ? (
              <a
                href={syllabus.viewUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="paper-btn paper-btn--gdrive"
                title="Open in Google Drive"
              >
                <svg
                  className="paper-btn__gdrive-icon"
                  viewBox="0 0 87.3 78"
                  width="16"
                  height="14"
                  aria-hidden="true"
                  focusable="false"
                >
                  <path
                    fill="#0066da"
                    d="m6.6 66.85 3.85 6.65c.8 1.4 1.95 2.5 3.3 3.3L27.5 53H0c0 1.55.4 3.1 1.2 4.5z"
                  />
                  <path
                    fill="#00ac47"
                    d="M43.65 25 29.9 1.2c-1.35.8-2.5 1.9-3.3 3.3l-25.4 44A9.06 9.06 0 0 0 0 53h27.5z"
                  />
                  <path
                    fill="#ea4335"
                    d="M73.55 76.8c1.35-.8 2.5-1.9 3.3-3.3l1.6-2.75L86.1 57.5c.8-1.4 1.2-2.95 1.2-4.5H59.798l5.852 11.5z"
                  />
                  <path
                    fill="#00832d"
                    d="M43.65 25 57.4 1.2C56.05.4 54.5 0 52.9 0H34.4c-1.6 0-3.15.45-4.5 1.2z"
                  />
                  <path
                    fill="#2684fc"
                    d="M59.8 53H27.5L13.75 76.8c1.35.8 2.9 1.2 4.5 1.2h50.8c1.6 0 3.15-.45 4.5-1.2z"
                  />
                  <path
                    fill="#ffba00"
                    d="m73.4 26.5-12.7-22c-.8-1.4-1.95-2.5-3.3-3.3L43.65 25 59.8 53h27.45c0-1.55-.4-3.1-1.2-4.5z"
                  />
                </svg>
                <span>Open in Google Drive</span>
              </a>
            ) : null}
          </>
        ) : (
          /* "Oops sorry!!! Syllabus Unavailable..." Box with Contribute Box */
          <div className="syllabus-unavailable-box" role="status">
            <div className="syllabus-unavailable-top">
              <div className="syllabus-unavailable-icon-wrap" aria-hidden="true">
                <svg
                  viewBox="0 0 52 52"
                  width="48"
                  height="48"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="3.2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  className="syllabus-unavailable-svg"
                >
                  {/* Circular Head Outline */}
                  <circle cx="22" cy="29" r="16" strokeWidth="3.2" />
                  {/* Left & Right Solid Eyes */}
                  <circle cx="17" cy="24.5" r="2.3" fill="currentColor" stroke="none" />
                  <circle cx="27" cy="24.5" r="2.3" fill="currentColor" stroke="none" />
                  {/* Smooth Curved Sad Mouth */}
                  <path d="M 15.5 35 Q 22 29.5 28.5 35" strokeWidth="3.2" />
                  {/* 3 Radiating Rays on Top-Right */}
                  <line x1="30" y1="10" x2="32.5" y2="4" strokeWidth="3" />
                  <line x1="36" y1="15" x2="42" y2="10" strokeWidth="3" />
                  <line x1="39" y1="22" x2="45.5" y2="21" strokeWidth="3" />
                </svg>
              </div>
              <div className="syllabus-unavailable-text">
                <div className="syllabus-unavailable-title-group">
                  <span className="syllabus-unavailable-oops">Oops sorry!!!</span>
                  <h4 className="syllabus-unavailable-title">Syllabus Unavailable...</h4>
                </div>
              </div>
            </div>

            {/* Contribute Box */}
            <a
              href="https://docs.google.com/forms/d/e/1FAIpQLSeqNSz975pjRQkkBi3z899RsckA9tf-KsXVkZxZOg_p8kAm8A/viewform?usp=dialog"
              target="_blank"
              rel="noopener noreferrer"
              className="syllabus-contribute-box"
              title="Click to contribute or submit this syllabus copy"
            >
              <div className="syllabus-contribute-box__left">
                <div className="syllabus-contribute-box__icon" aria-hidden="true">
                  <svg
                    viewBox="0 0 24 24"
                    width="17"
                    height="17"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2.2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  >
                    <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
                    <polyline points="17 8 12 3 7 8" />
                    <line x1="12" y1="3" x2="12" y2="15" />
                  </svg>
                </div>
                <div className="syllabus-contribute-box__text">
                  <span className="syllabus-contribute-box__title">Have this syllabus?</span>
                  <span className="syllabus-contribute-box__sub">Upload copy to help other students</span>
                </div>
              </div>
              <span className="syllabus-contribute-box__badge">Contribute ↗</span>
            </a>
          </div>
        )}
      </div>
    </div>
  );
}

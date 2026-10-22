"use client";

import React from "react";
import Link from "next/link";
import { PaperItem } from "@/lib/paper-service";

export interface PaperCardProps {
  paper: PaperItem;
  returnQueryString?: string;
  onUnavailableDownload?: (paper: PaperItem) => void;
}

export function getExamBadgeClass(examType: string): string {
  const upper = examType.toUpperCase();
  if (upper.includes("CAT-1") || upper === "CAT 1" || upper === "CAT1") return "exam-badge--cat1";
  if (upper.includes("CAT-2") || upper === "CAT 2" || upper === "CAT2") return "exam-badge--cat2";
  if (upper.includes("FAT")) return "exam-badge--fat";
  if (upper.includes("QUIZ")) return "exam-badge--quiz";
  return "exam-badge--other";
}

export default function PaperCard({
  paper,
  returnQueryString = "",
  onUnavailableDownload,
}: PaperCardProps) {
  const viewUrl = `/papers/${encodeURIComponent(paper.paperId)}${returnQueryString}`;
  const examBadgeClass = getExamBadgeClass(paper.examType);
  const hasFile = Boolean(paper.effectiveDriveId || paper.downloadUrl);

  const handleUnavailableClick = (e: React.MouseEvent) => {
    if (!hasFile) {
      e.preventDefault();
      onUnavailableDownload?.(paper);
    }
  };

  return (
    <div className="paper-card" id={`paper-${paper.paperId}`}>
      {/* Header with Course Code & Exam Type */}
      <div className="paper-card__header">
        <div className="paper-card__tags">
          <span className="paper-card__code">{paper.courseCode}</span>
          <span className={`paper-card__exam ${examBadgeClass}`}>
            {paper.examType}
          </span>
        </div>
      </div>

      {/* Course Title */}
      <div className="paper-card__body">
        <Link href={viewUrl} className="paper-card__title-link">
          <h3 className="paper-card__title" title={paper.courseName}>
            {paper.courseName}
          </h3>
        </Link>

        {/* Metadata Details */}
        <div className="paper-card__meta">
          <div className="paper-card__meta-item" title="Academic Term & Year">
            <svg className="i" aria-hidden="true" viewBox="0 0 24 24">
              <rect x="3" y="4" width="18" height="18" rx="2" ry="2" />
              <line x1="16" y1="2" x2="16" y2="6" />
              <line x1="8" y1="2" x2="8" y2="6" />
              <line x1="3" y1="10" x2="21" y2="10" />
            </svg>
            <span>
              {paper.semester} {paper.academicYear}
            </span>
          </div>

          {paper.slot ? (
            <div className="paper-card__meta-item" title="Class Slot">
              <svg className="i" aria-hidden="true" viewBox="0 0 24 24">
                <circle cx="12" cy="10" r="10" />
                <polyline points="12 6 12 12 16 14" />
              </svg>
              <span>{paper.slot}</span>
            </div>
          ) : null}
        </div>
      </div>

      {/* Action Buttons: View Paper, View in Drive, Download PDF */}
      <div className="paper-card__actions">
        <Link href={viewUrl} className="paper-btn paper-btn--primary">
          <svg className="i" aria-hidden="true" viewBox="0 0 24 24">
            <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
            <circle cx="12" cy="12" r="3" />
          </svg>
          <span>View Paper</span>
        </Link>

        <div className="paper-card__sub-actions">
          {paper.driveViewUrl ? (
            <a
              href={paper.driveViewUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="paper-btn paper-btn--secondary"
              title="Open file directly in Google Drive"
            >
              <svg className="i" aria-hidden="true" viewBox="0 0 24 24">
                <path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6" />
                <polyline points="15 3 21 3 21 9" />
                <line x1="10" y1="14" x2="21" y2="3" />
              </svg>
              <span>View in Drive</span>
            </a>
          ) : (
            <button
              type="button"
              onClick={handleUnavailableClick}
              className="paper-btn paper-btn--secondary paper-btn--muted"
              title="Drive link not yet attached"
            >
              <svg className="i" aria-hidden="true" viewBox="0 0 24 24">
                <path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6" />
                <polyline points="15 3 21 3 21 9" />
                <line x1="10" y1="14" x2="21" y2="3" />
              </svg>
              <span>Drive</span>
            </button>
          )}

          {hasFile && paper.downloadUrl ? (
            <a
              href={paper.downloadUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="paper-btn paper-btn--secondary"
              title="Download PDF directly"
            >
              <svg className="i" aria-hidden="true" viewBox="0 0 24 24">
                <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
                <polyline points="7 10 12 15 17 10" />
                <line x1="12" y1="15" x2="12" y2="3" />
              </svg>
              <span>Download</span>
            </a>
          ) : (
            <button
              type="button"
              onClick={handleUnavailableClick}
              className="paper-btn paper-btn--secondary paper-btn--muted"
              title="Scan not yet attached - click for info"
            >
              <svg className="i" aria-hidden="true" viewBox="0 0 24 24">
                <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
                <polyline points="7 10 12 15 17 10" />
                <line x1="12" y1="15" x2="12" y2="3" />
              </svg>
              <span>Download</span>
            </button>
          )}
        </div>
      </div>
    </div>
  );
}

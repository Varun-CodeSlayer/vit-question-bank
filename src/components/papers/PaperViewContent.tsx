"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import { fetchPaperById, PaperItem } from "@/lib/paper-service";
import { getExamBadgeClass } from "@/components/papers/PaperCard";

export interface PaperViewContentProps {
  paperId: string;
}

export default function PaperViewContent({ paperId }: PaperViewContentProps) {
  const searchParams = useSearchParams();
  const [paper, setPaper] = useState<PaperItem | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [iframeLoaded, setIframeLoaded] = useState(false);

  // Preserve the search query parameters when clicking Back to Papers
  const returnQueryString = searchParams.toString() ? `?${searchParams.toString()}` : "";
  const backToPapersHref = `/papers${returnQueryString}`;

  useEffect(() => {
    let ignore = false;
    async function loadPaper() {
      setLoading(true);
      try {
        const data = await fetchPaperById(paperId);
        if (ignore) return;
        setPaper(data);
        setError(null);
      } catch (err: unknown) {
        if (ignore) return;
        console.error("Error loading paper:", err);
        setError(err instanceof Error ? err.message : "Failed to load paper details");
      } finally {
        if (!ignore) setLoading(false);
      }
    }
    loadPaper();
    return () => {
      ignore = true;
    };
  }, [paperId]);

  const hasFile = Boolean(paper?.effectiveDriveId || paper?.downloadUrl);
  const embedUrl = paper?.embedUrl;
  const examBadgeClass = paper ? getExamBadgeClass(paper.examType) : "";

  return (
    <div className="practice-page paper-view-page">
      <div className="ambient" aria-hidden="true">
        <div className="ambient__blob ambient__blob--blue"></div>
        <div className="ambient__blob ambient__blob--violet"></div>
      </div>

      <div className="practice-layer">
        <Navbar />

        <main className="paper-view-main">
          {/* Breadcrumb Navigation */}
          <nav className="paper-view-crumbs" aria-label="Breadcrumb">
            <Link href="/">Home</Link>
            <span className="crumb-sep">/</span>
            <Link href={backToPapersHref}>Papers</Link>
            <span className="crumb-sep">/</span>
            {paper ? (
              <span aria-current="page">
                {paper.courseCode} · {paper.examType}
              </span>
            ) : (
              <span>Loading...</span>
            )}
          </nav>

          {/* Loading State */}
          {loading ? (
            <div className="paper-view-loading">
              <div className="paper-view-header-skeleton">
                <div className="skeleton-bar" style={{ width: "30%", height: "24px" }}></div>
                <div className="skeleton-bar" style={{ width: "70%", height: "40px", margin: "16px 0" }}></div>
                <div className="skeleton-bar" style={{ width: "50%", height: "20px" }}></div>
              </div>
              <div className="paper-viewer-skeleton">
                <div className="viewer-spinner"></div>
                <p>Loading question paper...</p>
              </div>
            </div>
          ) : error || !paper ? (
            /* Error / Not Found State */
            <div className="paper-view-error">
              <div className="empty-icon">
                <svg className="i" viewBox="0 0 24 24">
                  <circle cx="12" cy="12" r="10" />
                  <line x1="12" y1="8" x2="12" y2="12" />
                  <line x1="12" y1="16" x2="12.01" y2="16" />
                </svg>
              </div>
              <h2>{error ? "Error Loading Paper" : "Paper Not Found"}</h2>
              <p>
                {error
                  ? error
                  : `We could not find any question paper with ID "${paperId}". It may have been renamed or removed.`}
              </p>
              <div style={{ marginTop: "24px" }}>
                <Link href={backToPapersHref} className="paper-btn paper-btn--primary">
                  ← Return to Question Papers
                </Link>
              </div>
            </div>
          ) : (
            /* Paper Details & Viewer */
            <>
              {/* Paper Header Card */}
              <div className="paper-view-header">
                <div className="paper-view-top-bar">
                  <Link href={backToPapersHref} className="paper-back-link">
                    <svg className="i" viewBox="0 0 24 24" aria-hidden="true">
                      <line x1="19" y1="12" x2="5" y2="12" />
                      <polyline points="12 19 5 12 12 5" />
                    </svg>
                    <span>Back to Papers</span>
                  </Link>

                  {/* Actions Bar */}
                  <div className="paper-view-actions">
                    {hasFile && paper.downloadUrl && (
                      <a
                        href={paper.downloadUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="paper-btn paper-btn--primary"
                        title="Download PDF file"
                      >
                        <svg className="i" viewBox="0 0 24 24" aria-hidden="true">
                          <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
                          <polyline points="7 10 12 15 17 10" />
                          <line x1="12" y1="15" x2="12" y2="3" />
                        </svg>
                        <span>Download PDF</span>
                      </a>
                    )}

                    {paper.effectiveDriveId && (
                      <a
                        href={paper.driveViewUrl || `https://drive.google.com/file/d/${paper.effectiveDriveId}/view`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="paper-btn paper-btn--secondary"
                        title="View file directly in Google Drive"
                      >
                        <svg className="i" viewBox="0 0 24 24" aria-hidden="true">
                          <path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6" />
                          <polyline points="15 3 21 3 21 9" />
                          <line x1="10" y1="14" x2="21" y2="3" />
                        </svg>
                        <span>View in Drive</span>
                      </a>
                    )}

                    <a
                      href="https://docs.google.com/forms/d/e/1FAIpQLSeqNSz975pjRQkkBi3z899RsckA9tf-KsXVkZxZOg_p8kAm8A/viewform?usp=dialog"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="paper-btn paper-btn--secondary"
                      title="Report an issue or suggest a correction"
                    >
                      <svg className="i" viewBox="0 0 24 24" aria-hidden="true">
                        <circle cx="12" cy="12" r="10" />
                        <line x1="12" y1="8" x2="12" y2="12" />
                        <line x1="12" y1="16" x2="12.01" y2="16" />
                      </svg>
                      <span>Report Issue</span>
                    </a>
                  </div>
                </div>

                {/* Course & Exam Title */}
                <div className="paper-view-title-block">
                  <div className="paper-view-badges">
                    <span className="paper-card__code">{paper.courseCode}</span>
                    <span className={`paper-card__exam ${examBadgeClass}`}>{paper.examType}</span>
                    {paper.slot && <span className="paper-badge-pill">Slot: {paper.slot}</span>}
                    {paper.maxMarks && <span className="paper-badge-pill">{paper.maxMarks} Marks</span>}
                  </div>

                  <h1 className="paper-view-title">{paper.courseName}</h1>

                  <div className="paper-view-meta-row">
                    <span>
                      <strong>Term:</strong> {paper.semester} {paper.academicYear}
                    </span>
                  </div>
                </div>
              </div>

              {/* PDF Viewer Container */}
              <div className="paper-viewer-card">
                {embedUrl ? (
                  <div className="paper-iframe-wrapper">
                    {!iframeLoaded && (
                      <div className="paper-iframe-loader">
                        <div className="viewer-spinner"></div>
                        <p>Connecting to Google Drive viewer...</p>
                      </div>
                    )}
                    <iframe
                      src={embedUrl}
                      className="paper-drive-iframe"
                      allow="autoplay"
                      title={`${paper.courseCode} ${paper.examType} Paper`}
                      onLoad={() => setIframeLoaded(true)}
                    />

                    {/* Helpful footer hints for permissions or cookie blockers */}
                    <div className="paper-iframe-footer">
                      <div className="paper-iframe-footer-text">
                        <span>Having trouble with the preview?</span>
                        <a
                          href={`https://drive.google.com/file/d/${paper.effectiveDriveId}/view`}
                          target="_blank"
                          rel="noopener noreferrer"
                        >
                          Open in Google Drive ↗
                        </a>
                        <span>or</span>
                        <a href={paper.downloadUrl || "#"} target="_blank" rel="noopener noreferrer">
                          Download file directly ↗
                        </a>
                      </div>
                      <span className="paper-iframe-secure-badge">
                        <svg className="i" viewBox="0 0 24 24" aria-hidden="true">
                          <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
                          <path d="M7 11V7a5 5 0 0 1 10 0v4" />
                        </svg>
                        Google Drive Verified Embed
                      </span>
                    </div>
                  </div>
                ) : (
                  /* Graceful State for Paper Metadata registered without active Drive link */
                  <div className="paper-unavailable-container">
                    <div className="paper-unavailable-icon">
                      <svg className="i" viewBox="0 0 24 24" aria-hidden="true">
                        <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
                        <polyline points="14 2 14 8 20 8" />
                        <line x1="12" y1="18" x2="12" y2="12" />
                        <line x1="9" y1="15" x2="15" y2="15" />
                      </svg>
                    </div>

                    <h3>PDF Scan Pending Upload</h3>
                    <p className="paper-unavailable-desc">
                      The exam paper record for <strong>{paper.courseCode} — {paper.courseName}</strong> (
                      {paper.examType}, {paper.academicTerm}) is indexed in our database, but the digitized PDF document
                      has not been uploaded yet.
                    </p>

                    <p className="paper-unavailable-hint">
                      If you have this exam paper, you can help other students prepare by submitting it through our contribution form!
                    </p>

                    <div className="paper-unavailable-button-row">
                      <a
                        href="https://docs.google.com/forms/d/e/1FAIpQLSeqNSz975pjRQkkBi3z899RsckA9tf-KsXVkZxZOg_p8kAm8A/viewform?usp=dialog"
                        target="_blank"
                        rel="noopener noreferrer"
                        className="paper-btn paper-btn--primary"
                      >
                        Contribute this Paper ↗
                      </a>
                      <Link href={backToPapersHref} className="paper-btn paper-btn--secondary">
                        ← Back to Question Papers
                      </Link>
                    </div>
                  </div>
                )}
              </div>
            </>
          )}
        </main>

        <Footer showCreator={false} />
      </div>
    </div>
  );
}


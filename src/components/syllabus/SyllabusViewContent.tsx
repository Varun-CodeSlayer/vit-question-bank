"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import { fetchSyllabusByCourseCode, SyllabusItem } from "@/lib/syllabus-service";

export interface SyllabusViewContentProps {
  courseCode: string;
}

export default function SyllabusViewContent({ courseCode }: SyllabusViewContentProps) {
  const searchParams = useSearchParams();
  const [syllabus, setSyllabus] = useState<SyllabusItem | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [iframeLoaded, setIframeLoaded] = useState(false);

  // Preserve search parameters when navigating back to syllabus listing
  const returnQueryString = searchParams.toString() ? `?${searchParams.toString()}` : "";
  const backToSyllabusHref = `/syllabus${returnQueryString}`;

  useEffect(() => {
    let ignore = false;
    async function loadSyllabus() {
      setLoading(true);
      try {
        const data = await fetchSyllabusByCourseCode(courseCode);
        if (ignore) return;
        setSyllabus(data);
        setError(null);
      } catch (err: unknown) {
        if (ignore) return;
        console.error("Error loading course syllabus:", err);
        setError(err instanceof Error ? err.message : "Failed to load syllabus details");
      } finally {
        if (!ignore) setLoading(false);
      }
    }
    loadSyllabus();
    return () => {
      ignore = true;
    };
  }, [courseCode]);

  const hasFile = Boolean(syllabus?.hasSyllabus);
  const embedUrl = syllabus?.embedUrl;
  const directDownloadUrl = syllabus?.downloadUrl || syllabus?.syllabusUrl;
  const driveViewUrl = syllabus?.viewUrl || syllabus?.syllabusUrl;

  return (
    <div className="practice-page paper-view-page syllabus-view-page">
      <div className="ambient" aria-hidden="true">
        <div className="ambient__blob ambient__blob--blue"></div>
        <div className="ambient__blob ambient__blob--violet"></div>
      </div>

      <div className="practice-layer">
        <Navbar />

        <main className="paper-view-main" id="main-content">
          {/* Breadcrumb Navigation */}
          <nav className="paper-view-crumbs" aria-label="Breadcrumb">
            <Link href="/">Home</Link>
            <span className="crumb-sep">/</span>
            <Link href={backToSyllabusHref}>Syllabus</Link>
            <span className="crumb-sep">/</span>
            {syllabus ? (
              <span aria-current="page">
                {syllabus.courseCode} · Syllabus
              </span>
            ) : (
              <span>Loading...</span>
            )}
          </nav>

          {/* Loading Skeleton */}
          {loading ? (
            <div className="paper-view-loading">
              <div className="paper-view-header-skeleton">
                <div className="skeleton-bar" style={{ width: "25%", height: "24px" }}></div>
                <div
                  className="skeleton-bar"
                  style={{ width: "65%", height: "40px", margin: "16px 0" }}
                ></div>
                <div className="skeleton-bar" style={{ width: "40%", height: "20px" }}></div>
              </div>
              <div className="paper-viewer-skeleton">
                <div className="viewer-spinner"></div>
                <p>Loading course syllabus...</p>
              </div>
            </div>
          ) : error || !syllabus ? (
            /* Error / Course Not Found State */
            <div className="paper-view-error">
              <div className="empty-icon">
                <svg className="i" viewBox="0 0 24 24">
                  <circle cx="12" cy="12" r="10" />
                  <line x1="12" y1="8" x2="12" y2="12" />
                  <line x1="12" y1="16" x2="12.01" y2="16" />
                </svg>
              </div>
              <h2>{error ? "Error Loading Syllabus" : "Course Not Found"}</h2>
              <p>
                {error
                  ? error
                  : `We could not find any course matching code "${courseCode}". It may have been renamed or removed.`}
              </p>
              <div style={{ marginTop: "24px" }}>
                <Link href={backToSyllabusHref} className="paper-btn paper-btn--primary">
                  ← Return to Syllabus Directory
                </Link>
              </div>
            </div>
          ) : (
            /* Syllabus Details & Embedded Drive Viewer */
            <>
              {/* Header Card */}
              <div className="paper-view-header">
                <div className="paper-view-top-bar">
                  <Link href={backToSyllabusHref} className="paper-back-link">
                    <svg className="i" viewBox="0 0 24 24" aria-hidden="true">
                      <line x1="19" y1="12" x2="5" y2="12" />
                      <polyline points="12 19 5 12 12 5" />
                    </svg>
                    <span>Back to Syllabus</span>
                  </Link>

                  {/* Actions Bar */}
                  <div className="paper-view-actions">
                    {hasFile && directDownloadUrl ? (
                      <a
                        href={directDownloadUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="paper-btn paper-btn--primary"
                        title="Download Syllabus PDF directly"
                      >
                        <svg className="i" viewBox="0 0 24 24" aria-hidden="true">
                          <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
                          <polyline points="7 10 12 15 17 10" />
                          <line x1="12" y1="15" x2="12" y2="3" />
                        </svg>
                        <span>Download PDF</span>
                      </a>
                    ) : null}

                    {hasFile && driveViewUrl ? (
                      <a
                        href={driveViewUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="paper-btn paper-btn--gdrive"
                        title="Open in Google Drive"
                      >
                        <svg
                          className="paper-btn__gdrive-icon"
                          viewBox="0 0 87.3 78"
                          width="18"
                          height="16"
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

                    <a
                      href="https://docs.google.com/forms/d/e/1FAIpQLSeqNSz975pjRQkkBi3z899RsckA9tf-KsXVkZxZOg_p8kAm8A/viewform?usp=dialog"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="paper-btn paper-btn--report"
                      title="Report an issue or suggest a syllabus update"
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

                {/* Course Details Header */}
                <div className="paper-view-title-block">
                  <div className="paper-view-badges">
                    <span className="paper-card__code">{syllabus.courseCode}</span>
                    <span className="paper-badge-pill">ACE Curriculum</span>
                  </div>

                  <h1 className="paper-view-title">{syllabus.courseName}</h1>

                  <div className="paper-view-meta-row">
                    <span>
                      <strong>Campus:</strong> {syllabus.courseId.startsWith("VITC") ? "VIT Chennai" : "VIT"}
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
                        <p>Connecting to Google Drive syllabus viewer...</p>
                      </div>
                    )}
                    <iframe
                      src={embedUrl}
                      className="paper-drive-iframe"
                      allow="autoplay"
                      title={`${syllabus.courseCode} Syllabus PDF`}
                      onLoad={() => setIframeLoaded(true)}
                    />

                    {/* Troubleshooting / Direct Link Footer */}
                    <div className="paper-iframe-footer">
                      <div className="paper-iframe-footer-text">
                        <span>Having trouble with the preview?</span>
                        {driveViewUrl && (
                          <a
                            href={driveViewUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                          >
                            Open in Google Drive ↗
                          </a>
                        )}
                        <span>or</span>
                        <a
                          href={directDownloadUrl || "#"}
                          target="_blank"
                          rel="noopener noreferrer"
                        >
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
                  /* Unavailable State: Syllabus URL is null or pending */
                  <div className="paper-unavailable-container">
                    <div className="paper-unavailable-icon">
                      <svg className="i" viewBox="0 0 24 24" aria-hidden="true">
                        <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
                        <polyline points="14 2 14 8 20 8" />
                        <line x1="12" y1="18" x2="12" y2="12" />
                        <line x1="9" y1="15" x2="15" y2="15" />
                      </svg>
                    </div>

                    <h3>Syllabus PDF Pending Upload</h3>
                    <p className="paper-unavailable-desc">
                      The course <strong>{syllabus.courseCode} — {syllabus.courseName}</strong> is registered
                      in the curriculum catalog, but the official digitized syllabus PDF has not been uploaded to Google Drive yet.
                    </p>

                    <p className="paper-unavailable-hint">
                      If you have the syllabus copy for this course, you can help other students by submitting it through our contribution form!
                    </p>

                    <div className="paper-unavailable-button-row">
                      <a
                        href="https://docs.google.com/forms/d/e/1FAIpQLSeqNSz975pjRQkkBi3z899RsckA9tf-KsXVkZxZOg_p8kAm8A/viewform?usp=dialog"
                        target="_blank"
                        rel="noopener noreferrer"
                        className="paper-btn paper-btn--primary"
                      >
                        Contribute Syllabus ↗
                      </a>
                      <Link href={backToSyllabusHref} className="paper-btn paper-btn--secondary">
                        ← Back to Syllabus Directory
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


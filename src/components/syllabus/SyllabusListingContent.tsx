"use client";

import React, { useState, useEffect, useMemo, useRef, useCallback } from "react";
import { useSearchParams, useRouter, usePathname } from "next/navigation";
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import SyllabusCard from "@/components/syllabus/SyllabusCard";
import { fetchAllSyllabi, SyllabusItem } from "@/lib/syllabus-service";

export default function SyllabusListingContent() {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const searchInputRef = useRef<HTMLInputElement>(null);

  const [syllabi, setSyllabi] = useState<SyllabusItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [retryCount, setRetryCount] = useState(0);
  const [unavailableModalItem, setUnavailableModalItem] = useState<SyllabusItem | null>(null);

  // Derive search from URL
  const urlSearch = searchParams.get("q") || "";
  const [searchQuery, setSearchQuery] = useState(urlSearch);
  const [prevUrlSearch, setPrevUrlSearch] = useState(urlSearch);

  // Sync state with URL when searchParams change externally (e.g. browser back/forward)
  if (prevUrlSearch !== urlSearch) {
    setPrevUrlSearch(urlSearch);
    setSearchQuery(urlSearch);
  }

  // Fetch all course syllabi from Supabase
  useEffect(() => {
    let ignore = false;
    async function loadData() {
      setLoading(true);
      try {
        const data = await fetchAllSyllabi();
        if (ignore) return;
        setSyllabi(data);
        setError(null);
      } catch (err: unknown) {
        if (ignore) return;
        console.error("Failed to load syllabi:", err);
        setError(
          err instanceof Error ? err.message : "Failed to load syllabi from database."
        );
      } finally {
        if (!ignore) setLoading(false);
      }
    }

    loadData();

    return () => {
      ignore = true;
    };
  }, [retryCount]);

  // URL search parameter updater
  const updateSearchParam = useCallback(
    (qVal: string) => {
      const current = new URLSearchParams(searchParams.toString());
      const trimmed = qVal.trim();
      if (trimmed) {
        current.set("q", trimmed);
      } else {
        current.delete("q");
      }
      const qs = current.toString();
      const targetUrl = qs ? `${pathname}?${qs}` : pathname;
      router.replace(targetUrl, { scroll: false });
    },
    [pathname, router, searchParams]
  );

  const handleSearchChange = (val: string) => {
    setSearchQuery(val);
    updateSearchParam(val);
  };

  const handleClearSearch = () => {
    setSearchQuery("");
    updateSearchParam("");
    if (searchInputRef.current) {
      searchInputRef.current.focus();
    }
  };

  // Case-insensitive search filtering across courseCode and courseName
  const filteredSyllabi = useMemo(() => {
    const q = searchQuery.trim().toLowerCase();
    if (!q) return syllabi;

    return syllabi.filter((item) => {
      const codeMatch = item.courseCode.toLowerCase().includes(q);
      const nameMatch = item.courseName.toLowerCase().includes(q);
      return codeMatch || nameMatch;
    });
  }, [syllabi, searchQuery]);

  // Stats calculation
  const totalCourses = syllabi.length;
  const availableCount = syllabi.filter((s) => s.hasSyllabus).length;
  const pendingCount = totalCourses - availableCount;

  // Preserve query string for "Back to Syllabus" navigation
  const currentQueryString = searchParams.toString() ? `?${searchParams.toString()}` : "";

  return (
    <div className="practice-page syllabus-page">
      {/* Background Ambient Glows */}
      <div className="ambient" aria-hidden="true">
        <div className="ambient__blob ambient__blob--blue"></div>
        <div className="ambient__blob ambient__blob--violet"></div>
      </div>

      <div className="practice-layer">
        <Navbar />

        <main className="papers-main syllabus-main" id="main-content">
          {/* Hero Section */}
          <section className="hero-practice" aria-labelledby="syllabusHeroTitle">
            <div className="hero__message">
              <h1 className="hero__title" id="syllabusHeroTitle">
                Course <span className="grad">Syllabus</span>.
              </h1>
              <p className="hero__lede">
                Browse and view official curriculum outlines and digitized syllabus PDFs for VIT Chennai courses.
              </p>
            </div>

            {/* Quick Summary Stats */}
            <div className="stats">
              <div className="stat">
                <span className="stat__value grad">{loading ? "..." : totalCourses}</span>
                <span className="stat__label">{totalCourses === 1 ? "COURSE" : "COURSES"}</span>
              </div>
              <span className="dot" aria-hidden="true"></span>
              <div className="stat">
                <span className="stat__value grad">{loading ? "..." : availableCount}</span>
                <span className="stat__label">AVAILABLE PDFS</span>
              </div>
              <span className="dot" aria-hidden="true"></span>
              <div className="stat">
                <span className="stat__value grad" style={{ filter: "hue-rotate(45deg)" }}>
                  {loading ? "..." : pendingCount}
                </span>
                <span className="stat__label">PENDING</span>
              </div>
            </div>
          </section>

          {/* Search Controls Card */}
          <section className="papers-controls-section" aria-label="Course Syllabus Search">
            <div className="papers-controls-card">
              <div className="search-practice">
                <div className="search__surface">
                  <svg className="i" aria-hidden="true" viewBox="0 0 24 24">
                    <circle cx="11" cy="11" r="8" />
                    <line x1="21" y1="21" x2="16.65" y2="16.65" />
                  </svg>
                  <input
                    ref={searchInputRef}
                    id="syllabusSearchInput"
                    className="search__input"
                    type="search"
                    placeholder="Search by course code (e.g. BACSE201) or course title..."
                    aria-label="Search course syllabus"
                    value={searchQuery}
                    onChange={(e) => handleSearchChange(e.target.value)}
                  />
                  {searchQuery && (
                    <button
                      type="button"
                      className="search-clear-btn"
                      onClick={handleClearSearch}
                      title="Clear search"
                      aria-label="Clear search input"
                    >
                      <svg
                        viewBox="0 0 24 24"
                        width="14"
                        height="14"
                        stroke="currentColor"
                        fill="none"
                        strokeWidth="2.5"
                      >
                        <path d="M18 6L6 18M6 6l12 12" />
                      </svg>
                    </button>
                  )}
                </div>
              </div>

              {/* Active Search Pill */}
              {searchQuery.trim() && (
                <div className="papers-active-pills-bar">
                  <span className="papers-active-pills-label">Active search:</span>
                  <div className="papers-pills-wrap">
                    <button
                      type="button"
                      className="papers-pill"
                      onClick={handleClearSearch}
                      title="Clear search filter"
                    >
                      <span>Search: &ldquo;{searchQuery}&rdquo;</span>
                      <svg className="i" viewBox="0 0 24 24" aria-hidden="true">
                        <path d="M18 6 6 18M6 6l12 12" />
                      </svg>
                    </button>
                    <button
                      type="button"
                      className="papers-clear-all-link"
                      onClick={handleClearSearch}
                    >
                      Clear
                    </button>
                  </div>
                </div>
              )}
            </div>
          </section>

          {/* Results Summary Counter */}
          <div className="papers-count-header">
            <h2>
              {loading ? (
                "Loading course syllabi..."
              ) : (
                <>
                  Showing <strong>{filteredSyllabi.length}</strong>{" "}
                  {filteredSyllabi.length === 1 ? "course" : "courses"}
                  {searchQuery.trim() && ` (matching "${searchQuery}")`}
                </>
              )}
            </h2>
          </div>

          {/* Results Grid / States */}
          <section className="papers-results-section" aria-label="Course Syllabus Grid">
            {loading ? (
              <div className="papers-skeleton-grid">
                {[1, 2, 3, 4, 5, 6].map((k) => (
                  <div key={k} className="paper-card-skeleton">
                    <div className="skeleton-bar" style={{ width: "35%", height: "20px" }}></div>
                    <div
                      className="skeleton-bar"
                      style={{ width: "85%", height: "26px", margin: "16px 0 8px" }}
                    ></div>
                    <div className="skeleton-bar" style={{ width: "50%", height: "16px" }}></div>
                    <div
                      className="skeleton-actions"
                      style={{ display: "flex", gap: "10px", marginTop: "24px" }}
                    >
                      <div
                        className="skeleton-bar"
                        style={{ flex: 1, height: "35px", borderRadius: "10px" }}
                      ></div>
                    </div>
                  </div>
                ))}
              </div>
            ) : error ? (
              <div className="papers-empty-state error-state">
                <div className="empty-icon">
                  <svg className="i" viewBox="0 0 24 24">
                    <circle cx="12" cy="12" r="10" />
                    <line x1="12" y1="8" x2="12" y2="12" />
                    <line x1="12" y1="16" x2="12.01" y2="16" />
                  </svg>
                </div>
                <h3>Unable to load course syllabi</h3>
                <p>{error}</p>
                <button
                  type="button"
                  className="btn accent"
                  onClick={() => setRetryCount((c) => c + 1)}
                >
                  Retry loading
                </button>
              </div>
            ) : filteredSyllabi.length === 0 ? (
              <div className="papers-empty-state">
                <div className="empty-icon">
                  <svg className="i" viewBox="0 0 24 24">
                    <circle cx="11" cy="11" r="8" />
                    <line x1="21" y1="21" x2="16.65" y2="16.65" />
                  </svg>
                </div>
                <h3>No courses found</h3>
                <p>
                  No course codes or course titles matched your search query &ldquo;{searchQuery}&rdquo;.
                </p>
                {searchQuery && (
                  <button type="button" className="btn accent" onClick={handleClearSearch}>
                    Clear search query
                  </button>
                )}
              </div>
            ) : (
              <div className="papers-grid">
                {filteredSyllabi.map((syllabus) => (
                  <SyllabusCard
                    key={syllabus.courseId}
                    syllabus={syllabus}
                    returnQueryString={currentQueryString}
                    onUnavailableClick={(item) => setUnavailableModalItem(item)}
                  />
                ))}
              </div>
            )}
          </section>
        </main>

        {/* Modal for Unavailable Syllabus */}
        {unavailableModalItem && (
          <div
            className="papers-modal-overlay"
            role="dialog"
            aria-modal="true"
            aria-labelledby="modalUnavailableTitle"
            onClick={() => setUnavailableModalItem(null)}
          >
            <div
              className="papers-modal-card"
              onClick={(e) => e.stopPropagation()}
            >
              <button
                type="button"
                className="papers-modal-close"
                onClick={() => setUnavailableModalItem(null)}
                aria-label="Close dialog"
              >
                ✕
              </button>

              <div className="paper-unavailable-icon" style={{ margin: "0 auto 16px" }}>
                <svg className="i" viewBox="0 0 24 24" aria-hidden="true">
                  <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
                  <polyline points="14 2 14 8 20 8" />
                  <line x1="12" y1="18" x2="12" y2="12" />
                  <line x1="9" y1="15" x2="15" y2="15" />
                </svg>
              </div>

              <h3 id="modalUnavailableTitle" style={{ fontSize: "19px", marginBottom: "8px" }}>
                Syllabus Pending Upload
              </h3>

              <p className="paper-unavailable-desc" style={{ fontSize: "14px", lineHeight: "1.5" }}>
                The course <strong>{unavailableModalItem.courseCode} — {unavailableModalItem.courseName}</strong>{" "}
                is indexed in the curriculum, but the official syllabus PDF document has not been uploaded to Google Drive yet.
              </p>

              <p className="paper-unavailable-hint" style={{ fontSize: "13px", marginTop: "12px" }}>
                Have this syllabus copy? You can help fellow students by sharing it via our contribution form!
              </p>

              <div
                className="paper-unavailable-button-row"
                style={{ marginTop: "24px", justifyContent: "center" }}
              >
                <a
                  href="https://docs.google.com/forms/d/e/1FAIpQLSeqNSz975pjRQkkBi3z899RsckA9tf-KsXVkZxZOg_p8kAm8A/viewform?usp=dialog"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="paper-btn paper-btn--primary"
                >
                  Contribute Syllabus ↗
                </a>
                <button
                  type="button"
                  onClick={() => setUnavailableModalItem(null)}
                  className="paper-btn paper-btn--secondary"
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        )}

        <Footer showCreator={false} />
      </div>
    </div>
  );
}


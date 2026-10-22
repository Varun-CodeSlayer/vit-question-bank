"use client";

import React, { useState, useEffect, useMemo, useRef, useCallback } from "react";
import { useRouter, useSearchParams, usePathname } from "next/navigation";
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import PaperCard from "@/components/papers/PaperCard";
import { fetchPapers, PaperItem } from "@/lib/paper-service";

export default function PapersListingContent() {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  // Data fetching state
  const [papers, setPapers] = useState<PaperItem[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [retryCount, setRetryCount] = useState(0);

  // Unavailable download modal state
  const [unavailableModalPaper, setUnavailableModalPaper] = useState<PaperItem | null>(null);

  // Derive filter values directly from URL searchParams
  const urlSearch = searchParams.get("q") || "";
  const courseFilter = searchParams.get("course") || "all";
  const examFilter = searchParams.get("exam") || "all";
  const semFilter = searchParams.get("sem") || "all";
  const ayFilter = searchParams.get("ay") || "all";

  // Local search query for responsive text input typing
  const [searchQuery, setSearchQuery] = useState(urlSearch);
  const [prevUrlSearch, setPrevUrlSearch] = useState(urlSearch);

  // Sync state with URL if URL changes externally (e.g. back/forward button)
  if (prevUrlSearch !== urlSearch) {
    setPrevUrlSearch(urlSearch);
    setSearchQuery(urlSearch);
  }

  const searchInputRef = useRef<HTMLInputElement>(null);

  // Load real papers from database
  useEffect(() => {
    let ignore = false;
    async function loadData() {
      setLoading(true);
      try {
        const data = await fetchPapers();
        if (ignore) return;
        setPapers(data);
        setError(null);
      } catch (err: unknown) {
        if (ignore) return;
        console.error("Failed to load papers:", err);
        setError(err instanceof Error ? err.message : "Failed to load papers from database");
      } finally {
        if (!ignore) setLoading(false);
      }
    }
    loadData();
    return () => {
      ignore = true;
    };
  }, [retryCount]);

  // Update URL search parameters when filters change
  const updateUrlParams = useCallback(
    (newParams: { q?: string; course?: string; exam?: string; sem?: string; ay?: string }) => {
      const current = new URLSearchParams(searchParams.toString());

      if (newParams.q !== undefined) {
        if (newParams.q.trim()) current.set("q", newParams.q.trim());
        else current.delete("q");
      }
      if (newParams.course !== undefined) {
        if (newParams.course && newParams.course !== "all") current.set("course", newParams.course);
        else current.delete("course");
      }
      if (newParams.exam !== undefined) {
        if (newParams.exam && newParams.exam !== "all") current.set("exam", newParams.exam);
        else current.delete("exam");
      }
      if (newParams.sem !== undefined) {
        if (newParams.sem && newParams.sem !== "all") current.set("sem", newParams.sem);
        else current.delete("sem");
      }
      if (newParams.ay !== undefined) {
        if (newParams.ay && newParams.ay !== "all") current.set("ay", newParams.ay);
        else current.delete("ay");
      }

      const queryString = current.toString();
      const targetUrl = queryString ? `${pathname}?${queryString}` : pathname;
      router.replace(targetUrl, { scroll: false });
    },
    [pathname, router, searchParams]
  );

  // Compute available filter dropdown options from real database records
  const filterOptions = useMemo(() => {
    const courseMap = new Map<string, string>();
    const semesters = new Set<string>();
    const examTypes = new Set<string>();
    const academicYears = new Set<string>();

    papers.forEach((p) => {
      if (p.courseCode) {
        courseMap.set(p.courseCode, p.courseName || p.courseCode);
      }
      if (p.semester && p.semester !== "Unknown") {
        semesters.add(p.semester);
      }
      if (p.examType && p.examType !== "Unknown") {
        examTypes.add(p.examType);
      }
      if (p.academicYear && p.academicYear !== "Unknown") {
        academicYears.add(p.academicYear);
      }
    });

    // Also include standard exam types: CAT-1, CAT-2, FAT, Quiz
    const standardExams = ["CAT-1", "CAT-2", "FAT", "Quiz"];
    standardExams.forEach((e) => examTypes.add(e));

    return {
      courses: Array.from(courseMap.entries())
        .map(([code, name]) => ({ code, name }))
        .sort((a, b) => a.code.localeCompare(b.code)),
      semesters: Array.from(semesters).sort(),
      examTypes: Array.from(examTypes).sort(),
      academicYears: Array.from(academicYears).sort().reverse(),
    };
  }, [papers]);

  // Handle filter changes
  const handleCourseChange = (val: string) => {
    updateUrlParams({ course: val });
  };

  const handleExamChange = (val: string) => {
    updateUrlParams({ exam: val });
  };

  const handleSemChange = (val: string) => {
    updateUrlParams({ sem: val });
  };

  const handleAyChange = (val: string) => {
    updateUrlParams({ ay: val });
  };

  const handleSearchChange = (val: string) => {
    setSearchQuery(val);
    updateUrlParams({ q: val });
  };

  const handleClearAllFilters = () => {
    setSearchQuery("");
    router.replace(pathname, { scroll: false });
    searchInputRef.current?.focus();
  };

  // Filtered papers
  const filteredPapers = useMemo(() => {
    const q = searchQuery.trim().toLowerCase();

    return papers.filter((paper) => {
      // Search query check
      if (q) {
        const matchCode = paper.courseCode.toLowerCase().includes(q);
        const matchName = paper.courseName.toLowerCase().includes(q);
        const matchPaperId = paper.paperId.toLowerCase().includes(q);
        const matchSlot = (paper.slot || "").toLowerCase().includes(q);
        const matchTerm = (paper.academicTerm || "").toLowerCase().includes(q);
        const matchFilename = (paper.originalFilename || "").toLowerCase().includes(q);

        if (!matchCode && !matchName && !matchPaperId && !matchSlot && !matchTerm && !matchFilename) {
          return false;
        }
      }

      // Course filter check
      if (courseFilter !== "all" && paper.courseCode.toUpperCase() !== courseFilter.toUpperCase()) {
        return false;
      }

      // Exam type filter check
      if (examFilter !== "all") {
        const pExam = paper.examType.toUpperCase();
        const fExam = examFilter.toUpperCase();
        if (fExam === "OTHER") {
          const isStandard =
            pExam.includes("CAT-1") ||
            pExam.includes("CAT 1") ||
            pExam.includes("CAT-2") ||
            pExam.includes("CAT 2") ||
            pExam.includes("FAT") ||
            pExam.includes("QUIZ");
          if (isStandard) return false;
        } else if (!pExam.includes(fExam)) {
          return false;
        }
      }

      // Semester filter check
      if (semFilter !== "all" && paper.semester.toLowerCase() !== semFilter.toLowerCase()) {
        return false;
      }

      // Academic Year filter check
      if (ayFilter !== "all" && !paper.academicYear.includes(ayFilter)) {
        return false;
      }

      return true;
    });
  }, [papers, searchQuery, courseFilter, examFilter, semFilter, ayFilter]);

  // Current query string to pass to individual view pages for state preservation
  const currentQueryString = searchParams.toString() ? `?${searchParams.toString()}` : "";
  const hasActiveFilters =
    searchQuery.trim().length > 0 ||
    courseFilter !== "all" ||
    examFilter !== "all" ||
    semFilter !== "all" ||
    ayFilter !== "all";

  return (
    <div className="practice-page papers-page">
      <div className="ambient" aria-hidden="true">
        <div className="ambient__blob ambient__blob--blue"></div>
        <div className="ambient__blob ambient__blob--violet"></div>
      </div>

      <div className="practice-layer">
        <Navbar />

        <main className="papers-main">
          {/* Hero Section */}
          <section className="hero-practice" aria-labelledby="papersHeroTitle">
            <div className="hero__message">
              <h1 className="hero__title" id="papersHeroTitle">
                Past <span className="grad">Exam Papers</span>.
              </h1>
              <p className="hero__lede">
                Browse and download real CAT 1, CAT 2, and FAT question papers organized by course, semester, and year.
              </p>
            </div>

            {/* Quick Summary Stats */}
            <div className="stats">
              <div className="stat">
                <span className="stat__value grad">{loading ? "..." : papers.length}</span>
                <span className="stat__label">{papers.length === 1 ? "PAPER" : "PAPERS"}</span>
              </div>
              <span className="dot" aria-hidden="true"></span>
              <div className="stat">
                <span className="stat__value grad">{loading ? "..." : filterOptions.courses.length}</span>
                <span className="stat__label">{filterOptions.courses.length === 1 ? "COURSE" : "COURSES"}</span>
              </div>
              <span className="dot" aria-hidden="true"></span>
              <div className="stat">
                <span className="stat__value grad">
                  {loading
                    ? "..."
                    : papers.filter((p) => Boolean(p.effectiveDriveId || p.downloadUrl)).length}
                </span>
                <span className="stat__label">AVAILABLE PDFS</span>
              </div>
            </div>
          </section>

          {/* Search and Filters Section */}
          <section className="papers-controls-section" aria-label="Paper Search and Filters">
            <div className="papers-controls-card">
              {/* Search Bar */}
              <div className="search-practice">
                <div className="search__surface">
                  <svg className="i" aria-hidden="true" viewBox="0 0 24 24">
                    <circle cx="11" cy="11" r="8" />
                    <line x1="21" y1="21" x2="16.65" y2="16.65" />
                  </svg>
                  <input
                    ref={searchInputRef}
                    id="paperSearchInput"
                    className="search__input"
                    type="search"
                    placeholder="Search by course code (e.g. BACSE201), title, or slot..."
                    aria-label="Search question papers"
                    value={searchQuery}
                    onChange={(e) => handleSearchChange(e.target.value)}
                  />
                  {searchQuery && (
                    <button
                      type="button"
                      className="search-clear-btn"
                      onClick={() => handleSearchChange("")}
                      title="Clear search"
                    >
                      <svg viewBox="0 0 24 24" width="14" height="14" stroke="currentColor" fill="none" strokeWidth="2.5">
                        <path d="M18 6L6 18M6 6l12 12" />
                      </svg>
                    </button>
                  )}
                </div>
              </div>

              {/* 4 Interactive Dropdown Filters */}
              <div className="papers-filters-grid">
                {/* 1. Course Filter */}
                <div className="papers-filter-field">
                  <label htmlFor="courseFilterSelect" className="papers-filter-label">
                    Course
                  </label>
                  <div className="papers-select-wrapper">
                    <select
                      id="courseFilterSelect"
                      className="papers-select"
                      value={courseFilter}
                      onChange={(e) => handleCourseChange(e.target.value)}
                    >
                      <option value="all">All Courses</option>
                      {filterOptions.courses.map((c) => (
                        <option key={c.code} value={c.code}>
                          {c.code} — {c.name}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                {/* 2. Semester Filter */}
                <div className="papers-filter-field">
                  <label htmlFor="semFilterSelect" className="papers-filter-label">
                    Semester
                  </label>
                  <div className="papers-select-wrapper">
                    <select
                      id="semFilterSelect"
                      className="papers-select"
                      value={semFilter}
                      onChange={(e) => handleSemChange(e.target.value)}
                    >
                      <option value="all">All Semesters</option>
                      {filterOptions.semesters.map((s) => (
                        <option key={s} value={s}>
                          {s}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                {/* 3. Exam Type Filter */}
                <div className="papers-filter-field">
                  <label htmlFor="examFilterSelect" className="papers-filter-label">
                    Exam Type
                  </label>
                  <div className="papers-select-wrapper">
                    <select
                      id="examFilterSelect"
                      className="papers-select"
                      value={examFilter}
                      onChange={(e) => handleExamChange(e.target.value)}
                    >
                      <option value="all">All Exams</option>
                      <option value="CAT-1">CAT-1</option>
                      <option value="CAT-2">CAT-2</option>
                      <option value="FAT">FAT</option>
                      <option value="Quiz">Quiz</option>
                      <option value="Other">Other</option>
                    </select>
                  </div>
                </div>

                {/* 4. Academic Year Filter */}
                <div className="papers-filter-field">
                  <label htmlFor="ayFilterSelect" className="papers-filter-label">
                    Academic Year
                  </label>
                  <div className="papers-select-wrapper">
                    <select
                      id="ayFilterSelect"
                      className="papers-select"
                      value={ayFilter}
                      onChange={(e) => handleAyChange(e.target.value)}
                    >
                      <option value="all">All Years</option>
                      {filterOptions.academicYears.map((ay) => (
                        <option key={ay} value={ay}>
                          {ay}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>
              </div>

              {/* Active Filter Pills Bar */}
              {hasActiveFilters && (
                <div className="papers-active-pills-bar">
                  <span className="papers-active-pills-label">Active filters:</span>
                  <div className="papers-pills-wrap">
                    {searchQuery.trim() && (
                      <button
                        type="button"
                        className="papers-pill"
                        onClick={() => handleSearchChange("")}
                        title="Remove search filter"
                      >
                        <span>Search: &ldquo;{searchQuery}&rdquo;</span>
                        <svg className="i" viewBox="0 0 24 24"><path d="M18 6 6 18M6 6l12 12" /></svg>
                      </button>
                    )}

                    {courseFilter !== "all" && (
                      <button
                        type="button"
                        className="papers-pill"
                        onClick={() => handleCourseChange("all")}
                        title="Remove course filter"
                      >
                        <span>Course: {courseFilter}</span>
                        <svg className="i" viewBox="0 0 24 24"><path d="M18 6 6 18M6 6l12 12" /></svg>
                      </button>
                    )}

                    {semFilter !== "all" && (
                      <button
                        type="button"
                        className="papers-pill"
                        onClick={() => handleSemChange("all")}
                        title="Remove semester filter"
                      >
                        <span>Semester: {semFilter}</span>
                        <svg className="i" viewBox="0 0 24 24"><path d="M18 6 6 18M6 6l12 12" /></svg>
                      </button>
                    )}

                    {examFilter !== "all" && (
                      <button
                        type="button"
                        className="papers-pill"
                        onClick={() => handleExamChange("all")}
                        title="Remove exam filter"
                      >
                        <span>Exam: {examFilter}</span>
                        <svg className="i" viewBox="0 0 24 24"><path d="M18 6 6 18M6 6l12 12" /></svg>
                      </button>
                    )}

                    {ayFilter !== "all" && (
                      <button
                        type="button"
                        className="papers-pill"
                        onClick={() => handleAyChange("all")}
                        title="Remove year filter"
                      >
                        <span>Year: {ayFilter}</span>
                        <svg className="i" viewBox="0 0 24 24"><path d="M18 6 6 18M6 6l12 12" /></svg>
                      </button>
                    )}

                    <button
                      type="button"
                      className="papers-clear-all-link"
                      onClick={handleClearAllFilters}
                    >
                      Clear all
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
                "Loading papers..."
              ) : (
                <>
                  Showing <strong>{filteredPapers.length}</strong> {filteredPapers.length === 1 ? "paper" : "papers"}
                  {hasActiveFilters && ` (filtered from ${papers.length} total)`}
                </>
              )}
            </h2>
          </div>

          {/* Papers Grid List */}
          <section className="papers-results-section" aria-label="Question Papers List">
            {loading ? (
              <div className="papers-skeleton-grid">
                {[1, 2, 3, 4, 5, 6].map((k) => (
                  <div key={k} className="paper-card-skeleton">
                    <div className="skeleton-bar" style={{ width: "40%", height: "20px" }}></div>
                    <div className="skeleton-bar" style={{ width: "80%", height: "26px", margin: "16px 0 8px" }}></div>
                    <div className="skeleton-bar" style={{ width: "60%", height: "16px" }}></div>
                    <div className="skeleton-actions" style={{ display: "flex", gap: "10px", marginTop: "24px" }}>
                      <div className="skeleton-bar" style={{ flex: 1, height: "40px", borderRadius: "10px" }}></div>
                      <div className="skeleton-bar" style={{ flex: 1, height: "40px", borderRadius: "10px" }}></div>
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
                <h3>Unable to load question papers</h3>
                <p>{error}</p>
                <button type="button" className="btn accent" onClick={() => setRetryCount((c) => c + 1)}>
                  Retry loading
                </button>
              </div>
            ) : filteredPapers.length === 0 ? (
              <div className="papers-empty-state">
                <div className="empty-icon">
                  <svg className="i" viewBox="0 0 24 24">
                    <circle cx="11" cy="11" r="8" />
                    <line x1="21" y1="21" x2="16.65" y2="16.65" />
                  </svg>
                </div>
                <h3>No question papers found</h3>
                <p>
                  No papers match your current search or filter combination.
                </p>
                {hasActiveFilters && (
                  <button type="button" className="btn accent" onClick={handleClearAllFilters}>
                    Clear all filters
                  </button>
                )}
              </div>
            ) : (
              <div className="papers-grid">
                {filteredPapers.map((paper) => (
                  <PaperCard
                    key={paper.paperId}
                    paper={paper}
                    returnQueryString={currentQueryString}
                    onUnavailableDownload={(p) => setUnavailableModalPaper(p)}
                  />
                ))}
              </div>
            )}
          </section>
        </main>

        {/* Modal for Unavailable Download Link */}
        {unavailableModalPaper && (
          <div
            className="papers-modal-overlay"
            role="dialog"
            aria-modal="true"
            aria-labelledby="modalTitle"
            onClick={() => setUnavailableModalPaper(null)}
          >
            <div className="papers-modal-content" onClick={(e) => e.stopPropagation()}>
              <button
                type="button"
                className="papers-modal-close"
                onClick={() => setUnavailableModalPaper(null)}
                aria-label="Close dialog"
              >
                ✕
              </button>

              <div className="papers-modal-icon">
                <svg className="i" viewBox="0 0 24 24">
                  <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
                  <polyline points="14 2 14 8 20 8" />
                  <line x1="12" y1="18" x2="12" y2="12" />
                  <line x1="9" y1="15" x2="15" y2="15" />
                </svg>
              </div>

              <h3 id="modalTitle">PDF Scan Pending</h3>
              <p>
                The paper for <strong>{unavailableModalPaper.courseCode} ({unavailableModalPaper.examType})</strong> is
                registered in the database, but the digitized PDF scan link has not been linked yet.
              </p>
              <p style={{ color: "var(--text2)", fontSize: "14px", marginTop: "8px" }}>
                You can still view questions from this paper in the Practice section, or contribute this paper to help other students!
              </p>

              <div className="papers-modal-actions">
                <a
                  href="https://docs.google.com/forms/d/e/1FAIpQLSeqNSz975pjRQkkBi3z899RsckA9tf-KsXVkZxZOg_p8kAm8A/viewform?usp=dialog"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="paper-btn paper-btn--primary"
                >
                  Contribute this Paper ↗
                </a>
                <button
                  type="button"
                  className="paper-btn paper-btn--secondary"
                  onClick={() => setUnavailableModalPaper(null)}
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

"use client";

import React, { useState, useMemo, useEffect, useCallback } from "react";
import Link from "next/link";
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import CourseOverview from "@/components/questions/CourseOverview";
import QuestionFilters from "@/components/questions/QuestionFilters";
import ModuleExplorer from "@/components/questions/ModuleExplorer";
import QuestionList from "@/components/questions/QuestionList";
import {
  COURSE,
  MODULES,
  QUESTIONS,
  TOPICS,
  BADGE_ICON,
  BADGE_TEXT,
  FACETS,
  CourseInfo,
  Module,
  Question,
  TopicMapEntry,
  isQuestionMatching,
} from "@/lib/question-data";
import {
  fetchCoursePracticeData,
  CoursePracticeData,
} from "@/lib/course-service";

export interface CoursePracticeContentProps {
  initialCourseCode?: string;
  initialData?: CoursePracticeData | null;
}

export default function CoursePracticeContent({
  initialCourseCode,
  initialData,
}: CoursePracticeContentProps) {
  const rawCode = initialCourseCode || COURSE.code;
  const courseCode = decodeURIComponent(rawCode).toUpperCase();

  // Data states
  const [course, setCourse] = useState<CourseInfo>(
    initialData?.course || {
      ...COURSE,
      code: courseCode,
    }
  );
  const [modules, setModules] = useState<Module[]>(
    initialData?.modules || MODULES
  );
  const [questions, setQuestions] = useState<Question[]>(
    initialData?.questions || QUESTIONS
  );
  const [topicsMap, setTopicsMap] = useState<Record<string, TopicMapEntry>>(
    initialData?.topicsMap || TOPICS
  );
  const [topicIndexMap, setTopicIndexMap] = useState<Record<string, string>>(
    initialData?.topicIndexMap || {}
  );
  const [isLive, setIsLive] = useState<boolean>(!!initialData);
  const [loading, setLoading] = useState<boolean>(!initialData);
  const [notFound, setNotFound] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  const [retryCount, setRetryCount] = useState(0);

  // Fetch course data from Supabase if not provided upfront
  useEffect(() => {
    if (initialData) return;
    let ignore = false;

    async function loadData() {
      try {
        const res = await fetchCoursePracticeData(courseCode);
        if (ignore) return;
        if (res) {
          setCourse(res.course);
          setModules(res.modules);
          setQuestions(res.questions);
          setTopicsMap(res.topicsMap);
          setTopicIndexMap(res.topicIndexMap);
          setIsLive(true);
          setNotFound(false);
          setError(null);
        } else {
          setNotFound(true);
        }
      } catch (err: unknown) {
        if (ignore) return;
        console.error("Failed to load course practice data:", err);
        setError(
          err instanceof Error
            ? err.message
            : "Failed to load course questions from database"
        );
      } finally {
        if (!ignore) {
          setLoading(false);
        }
      }
    }

    loadData();
    return () => {
      ignore = true;
    };
  }, [courseCode, initialData, retryCount]);

  const handleRetry = () => {
    setLoading(true);
    setError(null);
    setNotFound(false);
    setRetryCount((c) => c + 1);
  };

  // Interactive filters & topic mode states
  const [activeTopicId, setActiveTopicId] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [activeFilters, setActiveFilters] = useState<Record<string, Set<string>>>(
    () => Object.fromEntries(FACETS.map((f) => [f.k, new Set()]))
  );

  // Sync hash with active topic
  useEffect(() => {
    const handleHash = () => {
      const hash = window.location.hash;
      const match = hash.match(/^#topic=(.+)$/);
      if (match) {
        const decodedTopic = decodeURIComponent(match[1]);
        if (topicsMap[decodedTopic]) {
          setActiveTopicId(topicsMap[decodedTopic].id);
          return;
        }
      }
      setActiveTopicId(null);
    };

    handleHash();
    window.addEventListener("hashchange", handleHash);
    return () => window.removeEventListener("hashchange", handleHash);
  }, [topicsMap]);

  const handleSelectTopic = useCallback((topicId: string) => {
    window.location.hash = `topic=${encodeURIComponent(topicId)}`;
    setActiveTopicId(topicId);
    window.scrollTo({
      top: 0,
      behavior: window.matchMedia("(prefers-reduced-motion: reduce)").matches
        ? "auto"
        : "smooth",
    });
  }, []);

  const handleBackToOverview = useCallback(() => {
    if (window.location.hash) {
      window.history.replaceState(
        null,
        "",
        window.location.pathname + window.location.search
      );
    }
    setActiveTopicId(null);
    window.scrollTo({
      top: 0,
      behavior: window.matchMedia("(prefers-reduced-motion: reduce)").matches
        ? "auto"
        : "smooth",
    });
  }, []);

  const handleFilterChange = useCallback(
    (key: string, value: string, checked: boolean) => {
      setActiveFilters((prev) => {
        const nextSet = new Set(prev[key] || []);
        if (checked) {
          nextSet.add(value);
        } else {
          nextSet.delete(value);
        }
        return {
          ...prev,
          [key]: nextSet,
        };
      });
    },
    []
  );

  const handleClearFilters = useCallback(() => {
    setActiveFilters(
      Object.fromEntries(FACETS.map((f) => [f.k, new Set()]))
    );
  }, []);

  const handleResetSearch = useCallback(() => {
    setSearchQuery("");
  }, []);

  // Filtered questions based on search & filters
  const allFilteredQuestions = useMemo(() => {
    return questions.filter((q) =>
      isQuestionMatching(q, searchQuery, activeFilters, undefined, topicsMap)
    );
  }, [questions, searchQuery, activeFilters, topicsMap]);

  const activeTopic = activeTopicId ? topicsMap[activeTopicId] || null : null;
  const isTopicMode = !!activeTopic;

  const topicFilteredQuestions = useMemo(() => {
    if (!activeTopicId) return [];
    return allFilteredQuestions.filter((q) => q.t === activeTopicId);
  }, [allFilteredQuestions, activeTopicId]);

  const hasActiveFilters = useMemo(() => {
    const hasFacet = Object.values(activeFilters).some(
      (s) => s && s.size > 0
    );
    return hasFacet || searchQuery.trim().length > 0;
  }, [activeFilters, searchQuery]);

  // Loading view
  if (loading) {
    return (
      <div className="course-bank">
        <Navbar />
        <main className="wrap" id="app">
          <nav className="crumbs" aria-label="Breadcrumb">
            <Link href="/">Home</Link>
            <svg className="ic" viewBox="0 0 24 24" aria-hidden="true">
              <path d="m9 18 6-6-6-6" />
            </svg>
            <Link href="/practice">Practice Questions</Link>
            <svg className="ic" viewBox="0 0 24 24" aria-hidden="true">
              <path d="m9 18 6-6-6-6" />
            </svg>
            <span aria-current="page">{courseCode}</span>
          </nav>

          <div
            className="empty"
            style={{ minHeight: "360px", display: "flex", flexDirection: "column", justifyContent: "center" }}
          >
            <div className="oc" style={{ animation: "pulse 1.5s infinite" }}>
              <svg className="ic" viewBox="0 0 24 24" aria-hidden="true">
                <circle cx="12" cy="12" r="10" />
                <path d="m9 12 2 2 4-4" />
              </svg>
            </div>
            <h3>Loading course question bank...</h3>
            <p>Fetching syllabus and past-year questions for {courseCode} from Supabase.</p>
          </div>
        </main>
        <Footer showCreator={false} />
      </div>
    );
  }

  // Not found in Supabase view
  if (notFound) {
    return (
      <div className="course-bank">
        <Navbar />
        <main className="wrap" id="app">
          <nav className="crumbs" aria-label="Breadcrumb">
            <Link href="/">Home</Link>
            <svg className="ic" viewBox="0 0 24 24" aria-hidden="true">
              <path d="m9 18 6-6-6-6" />
            </svg>
            <Link href="/practice">Practice Questions</Link>
            <svg className="ic" viewBox="0 0 24 24" aria-hidden="true">
              <path d="m9 18 6-6-6-6" />
            </svg>
            <span aria-current="page">{courseCode}</span>
          </nav>

          <div className="empty" style={{ margin: "40px 0 80px" }}>
            <div className="oc">
              <svg className="ic" viewBox="0 0 24 24" aria-hidden="true">
                <circle cx="12" cy="12" r="10" />
                <path d="M12 8v4" />
                <path d="M12 16h.01" />
              </svg>
            </div>
            <h3>Course not found in database</h3>
            <p>
              Course code <strong>{courseCode}</strong> is not yet indexed in Supabase.
              Available course: <strong>BACSE201</strong> (Models of Computation).
            </p>
            <div className="btns">
              <Link href="/practice" className="btn accent">
                Browse available courses
              </Link>
              <Link href="/practice/BACSE201" className="btn">
                Open BACSE201 Question Bank
              </Link>
            </div>
          </div>
        </main>
        <Footer showCreator={false} />
      </div>
    );
  }

  // Database error view
  if (error) {
    return (
      <div className="course-bank">
        <Navbar />
        <main className="wrap" id="app">
          <nav className="crumbs" aria-label="Breadcrumb">
            <Link href="/">Home</Link>
            <svg className="ic" viewBox="0 0 24 24" aria-hidden="true">
              <path d="m9 18 6-6-6-6" />
            </svg>
            <Link href="/practice">Practice Questions</Link>
            <svg className="ic" viewBox="0 0 24 24" aria-hidden="true">
              <path d="m9 18 6-6-6-6" />
            </svg>
            <span aria-current="page">{courseCode}</span>
          </nav>

          <div className="empty" style={{ margin: "40px 0 80px" }}>
            <div className="oc">
              <svg className="ic" viewBox="0 0 24 24" aria-hidden="true">
                <circle cx="12" cy="12" r="10" />
                <path d="m15 9-6 6" />
                <path d="m9 9 6 6" />
              </svg>
            </div>
            <h3>Unable to load questions</h3>
            <p>{error}</p>
            <div className="btns">
              <button type="button" className="btn accent" onClick={handleRetry}>
                Try again
              </button>
              <Link href="/practice" className="btn">
                Return to courses
              </Link>
            </div>
          </div>
        </main>
        <Footer showCreator={false} />
      </div>
    );
  }

  return (
    <div className="course-bank">
      <Navbar />

      <main className="wrap" id="app">
        <CourseOverview
          course={course}
          questions={questions}
          modules={modules}
          viewMode={isTopicMode ? "topic" : "overview"}
          activeTopic={activeTopic}
          onBackToOverview={handleBackToOverview}
          isLive={isLive}
        />

        <QuestionFilters
          questions={questions}
          activeFilters={activeFilters}
          onFilterChange={handleFilterChange}
          onClearFilters={handleClearFilters}
          searchQuery={searchQuery}
          onSearchChange={setSearchQuery}
          totalMatches={allFilteredQuestions.length}
          topicsMap={topicsMap}
        />

        <div className="cols">
          <div className="main-col" id="mainCol">
            {isTopicMode ? (
              <QuestionList
                questions={topicFilteredQuestions}
                onClearFilters={handleClearFilters}
                onResetSearch={handleResetSearch}
                isLive={isLive}
              />
            ) : hasActiveFilters && allFilteredQuestions.length === 0 ? (
              <div className="empty">
                <div className="oc">
                  <svg className="ic" viewBox="0 0 24 24" aria-hidden="true">
                    <circle cx="11" cy="11" r="8" />
                    <path d="m21 21-4.3-4.3" />
                  </svg>
                </div>
                <h3>No questions match these filters</h3>
                <p>
                  Try removing a filter or searching for a different topic. Your
                  syllabus modules and topics are unchanged.
                </p>
                <div className="btns">
                  <button
                    className="btn accent"
                    type="button"
                    onClick={handleClearFilters}
                  >
                    Clear all filters
                  </button>
                  <button
                    className="btn"
                    type="button"
                    onClick={handleResetSearch}
                  >
                    Reset search
                  </button>
                </div>
              </div>
            ) : (
              <ModuleExplorer
                modules={modules}
                questions={questions}
                filteredQuestions={allFilteredQuestions}
                hasActiveFilters={hasActiveFilters}
                onSelectTopic={handleSelectTopic}
                topicIndexMap={topicIndexMap}
                isLive={isLive}
              />
            )}
          </div>

          <aside className="side" id="side" aria-label="Course information">
            {isTopicMode && activeTopic && (
              <div className="panel">
                <div
                  className="overline"
                  style={{ fontSize: "11px", letterSpacing: "1.5px" }}
                >
                  Current topic
                </div>
                <h3 style={{ fontSize: "16px", lineHeight: "1.3" }}>
                  {topicIndexMap[activeTopic.id] || activeTopic.id}&nbsp; {activeTopic.title}
                </h3>
                <p>
                  Module {activeTopic.mod.n} · {activeTopic.mod.title}
                </p>
                <hr />
                <div className="row">
                  Questions in topic
                  <b>{questions.filter((q) => q.t === activeTopic.id).length}</b>
                </div>
                <div className="row">
                  Matching your filters
                  <b>{topicFilteredQuestions.length}</b>
                </div>
                <div className="row">
                  Showing now
                  <b>{Math.min(4, topicFilteredQuestions.length)}</b>
                </div>
                {!isLive && (
                  <div className="pnote">
                    <svg className="ic s" viewBox="0 0 24 24" aria-hidden="true">
                      <circle cx="12" cy="12" r="10" />
                      <path d="M12 16v-4" />
                      <path d="M12 8h.01" />
                    </svg>
                    Counts are placeholders
                  </div>
                )}
              </div>
            )}

            <div className="panel">
              <h3>
                <svg className="ic" viewBox="0 0 24 24" aria-hidden="true">
                  <path d="m12.83 2.18a2 2 0 0 0-1.66 0L2.6 6.08a1 1 0 0 0 0 1.83l8.58 3.91a2 2 0 0 0 1.66 0l8.58-3.9a1 1 0 0 0 0-1.83Z" />
                  <path d="m22 17.65-9.17 4.16a2 2 0 0 1-1.66 0L2 17.65" />
                  <path d="m22 12.65-9.17 4.16a2 2 0 0 1-1.66 0L2 12.65" />
                </svg>
                Curriculum coverage
              </h3>
              <p>
                Questions are mapped to the current syllabus where possible.
                Older and unmapped questions are labelled on each card.
              </p>
              {(["Current", "Older", "Unmapped"] as const).map((key) => {
                const count = questions.filter((q) => q.cur === key).length;
                const icon = BADGE_ICON[key];
                const text = BADGE_TEXT[key];

                return (
                  <div className="row" key={key}>
                    <span className={`badge ${key}`}>
                      <svg
                        className="ic"
                        viewBox="0 0 24 24"
                        aria-hidden="true"
                      >
                        {icon === "check" && <path d="M20 6 9 17l-5-5" />}
                        {icon === "alert" && (
                          <>
                            <path d="m21.73 18-8-14a2 2 0 0 0-3.48 0l-8 14A2 2 0 0 0 4 21h16a2 2 0 0 0 1.73-3" />
                            <path d="M12 9v4" />
                            <path d="M12 17h.01" />
                          </>
                        )}
                        {icon === "info" && (
                          <>
                            <circle cx="12" cy="12" r="10" />
                            <path d="M12 16v-4" />
                            <path d="M12 8h.01" />
                          </>
                        )}
                      </svg>
                      {text}
                    </span>
                    <span>
                      <b>{count}</b> <small>questions</small>
                    </span>
                  </div>
                );
              })}
              <hr />
              <div className="pnote">
                <svg className="ic s" viewBox="0 0 24 24" aria-hidden="true">
                  <circle cx="12" cy="12" r="10" />
                  <path d="M12 16v-4" />
                  <path d="M12 8h.01" />
                </svg>
                {isLive ? "Live counts from database" : "Sample counts — placeholders"}
              </div>
            </div>
          </aside>
        </div>
      </main>

      <Footer showCreator={false} />
    </div>
  );
}

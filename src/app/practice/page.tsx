"use client";

import React, { useState, useMemo, useRef, useEffect } from "react";
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import QuestionCard, { Course } from "@/components/questions/QuestionCard";
import {
  fetchCoursesWithCounts,
  fetchPlatformStats,
  PlatformStats,
} from "@/lib/course-service";

export default function PracticePage() {
  const [courses, setCourses] = useState<Course[]>([]);
  const [stats, setStats] = useState<PlatformStats>({
    coursesCount: 0,
    papersCount: 0,
    questionsCount: 0,
  });
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  const [searchQuery, setSearchQuery] = useState("");
  const searchInputRef = useRef<HTMLInputElement>(null);

  const [retryCount, setRetryCount] = useState(0);

  useEffect(() => {
    let ignore = false;

    async function loadData() {
      try {
        const [fetchedCourses, fetchedStats] = await Promise.all([
          fetchCoursesWithCounts(),
          fetchPlatformStats(),
        ]);

        if (ignore) return;
        const mapped: Course[] = fetchedCourses.map((c) => ({
          code: c.code,
          name: c.name,
          count: c.count,
        }));

        setCourses(mapped);
        setStats(fetchedStats);
        setError(null);
      } catch (err: unknown) {
        if (ignore) return;
        console.error("Failed to load courses from Supabase:", err);
        setError(
          err instanceof Error
            ? err.message
            : "Failed to load courses from database"
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
  }, [retryCount]);

  const handleRetry = () => {
    setLoading(true);
    setError(null);
    setRetryCount((c) => c + 1);
  };

  // Ensure marquee has enough repeated items to scroll smoothly without visual gaps
  const marqueeList = useMemo(() => {
    if (courses.length === 0) return [];
    let list = [...courses];
    while (list.length < 8) {
      list = list.concat(courses);
    }
    return list;
  }, [courses]);

  const half = Math.floor(marqueeList.length / 2);
  const rowOne = marqueeList;
  const rowTwo = useMemo(() => {
    if (marqueeList.length === 0) return [];
    return marqueeList.slice(half).concat(marqueeList.slice(0, half));
  }, [marqueeList, half]);

  const filteredCourses = useMemo(() => {
    const q = searchQuery.trim().toLowerCase();
    if (!q) return [];
    return courses.filter(
      (c) =>
        c.code.toLowerCase().includes(q) || c.name.toLowerCase().includes(q)
    );
  }, [courses, searchQuery]);

  const isSearching = searchQuery.trim().length > 0;

  const handleClear = () => {
    setSearchQuery("");
    searchInputRef.current?.focus();
  };

  return (
    <div className="practice-page">
      <div className="ambient" aria-hidden="true">
        <div className="ambient__blob ambient__blob--blue"></div>
        <div className="ambient__blob ambient__blob--violet"></div>
      </div>

      <div className="practice-layer">
        <Navbar />

        <main>
          {/* Hero */}
          <section className="hero-practice" aria-labelledby="heroTitle">
            <div className="hero__message">
              <h1 className="hero__title" id="heroTitle">
                Every <span className="grad">question</span>. Every{" "}
                <span className="grad">topic</span>. Every{" "}
                <span className="grad">course</span>.
              </h1>
              <p className="hero__lede">
                Find the questions you need, organised by course and topic.
              </p>
            </div>
            <div className="stats">
              <div className="stat">
                <span className="stat__value grad">
                  {loading ? "..." : stats.coursesCount || courses.length}
                </span>
                <span className="stat__label">
                  {stats.coursesCount === 1 ? "COURSE" : "COURSES"}
                </span>
              </div>
              <span className="dot" aria-hidden="true"></span>
              <div className="stat">
                <span className="stat__value grad">
                  {loading ? "..." : stats.papersCount}
                </span>
                <span className="stat__label">
                  {stats.papersCount === 1 ? "PAPER" : "PAPERS"}
                </span>
              </div>
              <span className="dot" aria-hidden="true"></span>
              <div className="stat">
                <span className="stat__value grad">
                  {loading ? "..." : stats.questionsCount}
                </span>
                <span className="stat__label">
                  {stats.questionsCount === 1 ? "QUESTION" : "QUESTIONS"}
                </span>
              </div>
            </div>
          </section>

          {/* Discovery */}
          <section className="discovery" aria-label="Course discovery">
            <div className="search-row">
              <div className="search-practice">
                <div className="search__surface">
                  <span className="search__icon" aria-hidden="true"></span>
                  <input
                    ref={searchInputRef}
                    id="courseSearch"
                    className="search__input"
                    type="search"
                    name="course-search"
                    autoComplete="off"
                    spellCheck={false}
                    placeholder="Search course, topic or code..."
                    aria-label="Search courses by name or code"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                  />
                </div>
              </div>
            </div>

            <div className="content">
              <h2 className="heading" id="heading" aria-live="polite">
                <span className="heading__rule" aria-hidden="true"></span>
                <span id="headingText">
                  {isSearching
                    ? `${filteredCourses.length} matching ${
                        filteredCourses.length === 1 ? "course" : "courses"
                      }`
                    : "AVAILABLE COURSES"}
                </span>
                <span className="heading__rule" aria-hidden="true"></span>
              </h2>

              {/* Loading indicator */}
              {loading && (
                <div
                  style={{
                    display: "flex",
                    justifyContent: "center",
                    alignItems: "center",
                    padding: "60px 20px",
                    color: "var(--t2)",
                  }}
                >
                  <p>Loading courses from Supabase...</p>
                </div>
              )}

              {/* Error indicator */}
              {!loading && error && (
                <div className="empty" id="empty">
                  <h3 className="empty__title">Unable to connect to database</h3>
                  <p className="empty__text">{error}</p>
                  <button
                    type="button"
                    className="chip"
                    onClick={handleRetry}
                  >
                    Retry connection
                  </button>
                </div>
              )}

              {/* Default state: two-row marquee */}
              {!loading && !error && !isSearching && courses.length > 0 && (
                <div className="marquee" id="marquee">
                  <div
                    className="row"
                    role="group"
                    aria-label="Available courses, row 1"
                  >
                    <div className="track">
                      <div className="set">
                        {rowOne.map((course, idx) => (
                          <QuestionCard
                            key={`r1-${course.code}-${idx}`}
                            course={course}
                          />
                        ))}
                      </div>
                      <div className="set" aria-hidden="true">
                        {rowOne.map((course, idx) => (
                          <QuestionCard
                            key={`dup-1-${course.code}-${idx}`}
                            course={course}
                            decorative={true}
                          />
                        ))}
                      </div>
                    </div>
                  </div>

                  <div
                    className="row row--reverse"
                    role="group"
                    aria-label="Available courses, row 2"
                  >
                    <div className="track">
                      <div className="set">
                        {rowTwo.map((course, idx) => (
                          <QuestionCard
                            key={`r2-${course.code}-${idx}`}
                            course={course}
                          />
                        ))}
                      </div>
                      <div className="set" aria-hidden="true">
                        {rowTwo.map((course, idx) => (
                          <QuestionCard
                            key={`dup-2-${course.code}-${idx}`}
                            course={course}
                            decorative={true}
                          />
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* Search states: results grid / empty */}
              {!loading && !error && isSearching && (
                <div className="results" id="results">
                  {filteredCourses.length > 0 ? (
                    <div className="grid" id="grid">
                      {filteredCourses.map((course) => (
                        <QuestionCard key={course.code} course={course} />
                      ))}
                    </div>
                  ) : (
                    <div className="empty" id="empty">
                      <h3 className="empty__title">No courses found</h3>
                      <p className="empty__text">
                        Try a different course name or code (e.g. BACSE201).
                      </p>
                      <button
                        type="button"
                        className="chip"
                        id="clearBtn"
                        onClick={handleClear}
                      >
                        Clear search
                      </button>
                    </div>
                  )}
                </div>
              )}

              <p
                className={`disclosure ${isSearching ? "is-start" : ""}`}
                id="disclosure"
              >
                Connected to Supabase · Live database data.
              </p>
            </div>
          </section>
        </main>

        <Footer showCreator={false} />
      </div>
    </div>
  );
}

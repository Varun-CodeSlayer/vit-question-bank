/* this is page.tsx file */
"use client";

import React, { useEffect, useState, useMemo, useRef } from "react";
import Link from "next/link";
import { fetchCoursesWithCounts } from "@/lib/course-service";

interface CourseItem {
  code: string;
  name: string;
  count?: number;
}

export default function Home() {
  const [theme, setTheme] = useState<"light" | "dark">("light");

  // Courses catalog for search - only courses present in the database
  const [courses, setCourses] = useState<CourseItem[]>([]);
  const [loadingCourses, setLoadingCourses] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCourse, setSelectedCourse] = useState<CourseItem | null>(null);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [highlightedIndex, setHighlightedIndex] = useState(-1);
  const [isListening, setIsListening] = useState(false);

  const searchContainerRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  // Sync theme
  useEffect(() => {
    const savedTheme = (typeof window !== "undefined" &&
      localStorage.getItem("theme")) as "light" | "dark" | null;
    const targetTheme =
      savedTheme ||
      (document.documentElement.dataset.theme === "dark" ? "dark" : "light");
    if (targetTheme !== "light") {
      queueMicrotask(() => {
        document.documentElement.dataset.theme = targetTheme;
        setTheme(targetTheme);
      });
    }
  }, []);

  const toggleTheme = () => {
    const newTheme = theme === "dark" ? "light" : "dark";
    setTheme(newTheme);
    document.documentElement.dataset.theme = newTheme;
    if (typeof window !== "undefined") {
      localStorage.setItem("theme", newTheme);
    }
  };

  // Reveal observer
  useEffect(() => {
    const rvElements = document.querySelectorAll(".rv");
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
  }, []);

  // Fetch live courses from Supabase database (strictly database courses only)
  useEffect(() => {
    let ignore = false;
    async function loadLiveCourses() {
      setLoadingCourses(true);
      try {
        const live = await fetchCoursesWithCounts();
        if (ignore) return;
        if (live && live.length > 0) {
          setCourses(
            live.map((c) => ({
              code: c.code,
              name: c.name,
              count: c.count,
            }))
          );
        } else {
          setCourses([]);
        }
      } catch (err) {
        console.warn("Could not fetch live courses for search bar:", err);
        if (!ignore) setCourses([]);
      } finally {
        if (!ignore) setLoadingCourses(false);
      }
    }
    loadLiveCourses();
    return () => {
      ignore = true;
    };
  }, []);

  // Filtered matching courses - only database courses
  const filteredCourses = useMemo(() => {
    const q = searchQuery.trim().toLowerCase();
    if (!q) {
      return courses;
    }
    return courses.filter(
      (c) =>
        c.code.toLowerCase().includes(q) ||
        c.name.toLowerCase().includes(q)
    );
  }, [courses, searchQuery]);

  // Click outside listener
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (
        searchContainerRef.current &&
        !searchContainerRef.current.contains(e.target as Node)
      ) {
        setIsDropdownOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Select a course
  const handleSelectCourse = (course: CourseItem) => {
    setSelectedCourse(course);
    setSearchQuery(`${course.code} - ${course.name}`);
    setIsDropdownOpen(false);
    setHighlightedIndex(-1);
  };

  // Clear selected course / search
  const handleClear = () => {
    setSelectedCourse(null);
    setSearchQuery("");
    setIsDropdownOpen(false);
    setHighlightedIndex(-1);
    inputRef.current?.focus();
  };

  // Keyboard navigation inside search dropdown
  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (!isDropdownOpen) {
      if (e.key === "ArrowDown" || e.key === "Enter") {
        setIsDropdownOpen(true);
      }
      return;
    }

    if (e.key === "ArrowDown") {
      e.preventDefault();
      setHighlightedIndex((prev) =>
        prev < filteredCourses.length - 1 ? prev + 1 : 0
      );
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      setHighlightedIndex((prev) =>
        prev > 0 ? prev - 1 : filteredCourses.length - 1
      );
    } else if (e.key === "Enter") {
      e.preventDefault();
      if (highlightedIndex >= 0 && filteredCourses[highlightedIndex]) {
        handleSelectCourse(filteredCourses[highlightedIndex]);
      } else if (filteredCourses.length > 0) {
        handleSelectCourse(filteredCourses[0]);
      }
    } else if (e.key === "Escape") {
      setIsDropdownOpen(false);
    }
  };

  // Optional Voice search via Web Speech API
  const handleVoiceSearch = () => {
    if (typeof window === "undefined") return;
    const SpeechRecognition =
      (window as unknown as { SpeechRecognition?: any }).SpeechRecognition ||
      (window as unknown as { webkitSpeechRecognition?: any }).webkitSpeechRecognition;

    if (!SpeechRecognition) {
      inputRef.current?.focus();
      return;
    }

    try {
      const recognition = new SpeechRecognition();
      recognition.lang = "en-US";
      recognition.interimResults = false;
      recognition.maxAlternatives = 1;

      setIsListening(true);

      recognition.onresult = (event: any) => {
        const transcript = event.results[0][0].transcript;
        if (transcript) {
          setSearchQuery(transcript);
          setSelectedCourse(null);
          setIsDropdownOpen(true);
        }
        setIsListening(false);
      };

      recognition.onerror = () => {
        setIsListening(false);
      };

      recognition.onend = () => {
        setIsListening(false);
      };

      recognition.start();
    } catch {
      setIsListening(false);
      inputRef.current?.focus();
    }
  };

  // Dynamic URLs for the 3 icons
  const practiceHref = selectedCourse
    ? `/practice/${encodeURIComponent(selectedCourse.code)}`
    : "/practice";
  const papersHref = selectedCourse
    ? `/papers?course=${encodeURIComponent(selectedCourse.code)}`
    : "/papers";
  const syllabusHref = selectedCourse
    ? `/syllabus?course=${encodeURIComponent(selectedCourse.code)}`
    : "/syllabus";

  // Derive marquee chips strictly from database courses
  const marqueeRows = useMemo(() => {
    const list: [string, string][] =
      courses.length > 0
        ? courses.map((c) => [c.code, c.name])
        : [
            ["BACSE106", "Operating Systems"],
            ["BACSE201", "Models of Computation"],
            ["BACSE202", "Database Systems"],
          ];
    return [list, list];
  }, [courses]);

  return (
    <>
      <svg width="0" height="0" style={{ position: "absolute" }} aria-hidden="true">
        <defs>
          <symbol id="search" viewBox="0 0 24 24"><circle cx="11" cy="11" r="8" /><path d="m21 21-4.3-4.3" /></symbol>
          <symbol id="mic" viewBox="0 0 24 24"><path d="M12 2a3 3 0 0 0-3 3v7a3 3 0 0 0 6 0V5a3 3 0 0 0-3-3Z" /><path d="M19 10v2a7 7 0 0 1-14 0v-2M12 19v3" /></symbol>
          <symbol id="book" viewBox="0 0 24 24"><path d="M2 3h6a4 4 0 0 1 4 4v14a3 3 0 0 0-3-3H2zM22 3h-6a4 4 0 0 0-4 4v14a3 3 0 0 1 3-3h7z" /></symbol>
          <symbol id="dl" viewBox="0 0 24 24"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4M7 10l5 5 5-5M12 15V3" /></symbol>
          <symbol id="checks" viewBox="0 0 24 24"><path d="m3 17 2 2 4-4M3 7l2 2 4-4M13 6h8M13 12h8M13 18h8" /></symbol>
          <symbol id="ne" viewBox="0 0 24 24"><path d="M7 7h10v10M7 17 17 7" /></symbol>
          <symbol id="up" viewBox="0 0 24 24"><path d="m5 12 7-7 7 7M12 19V5" /></symbol>
          <symbol id="home" viewBox="0 0 24 24"><path d="M15 21v-8a1 1 0 0 0-1-1h-4a1 1 0 0 0-1 1v8" /><path d="M3 10a2 2 0 0 1 .7-1.5l7-6a2 2 0 0 1 2.6 0l7 6A2 2 0 0 1 21 10v9a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" /></symbol>
          <symbol id="file" viewBox="0 0 24 24"><path d="M20 7h-3a2 2 0 0 1-2-2V2" /><path d="M9 18a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h7l4 4v10a2 2 0 0 1-2 2Z" /><path d="M3 7.6v12.8A1.6 1.6 0 0 0 4.6 22h9.8" /></symbol>
          <symbol id="marked" viewBox="0 0 24 24"><path d="M4 19.5v-15A2.5 2.5 0 0 1 6.5 2H20v20H6.5a2.5 2.5 0 0 1 0-5H20" /><polyline points="10 2 10 10 13 7 16 10 16 2" /></symbol>
          <symbol id="cap" viewBox="0 0 24 24"><path d="M21.4 10.9a1 1 0 0 0 0-1.8L12.8 5.2a2 2 0 0 0-1.7 0L2.6 9.1a1 1 0 0 0 0 1.8l8.6 3.9a2 2 0 0 0 1.7 0zM22 10v6M6 12.5V16a6 3 0 0 0 12 0v-3.5" /></symbol>
          <symbol id="filter" viewBox="0 0 24 24"><path d="M22 3H2l8 9.5V19l4 2v-8.5z" /></symbol>
          <symbol id="plus" viewBox="0 0 24 24"><path d="M12 5v14M5 12h14" /></symbol>
          <symbol id="target" viewBox="0 0 24 24"><circle cx="12" cy="12" r="10" /><circle cx="12" cy="12" r="6" /><circle cx="12" cy="12" r="2" /></symbol>
          <symbol id="pin" viewBox="0 0 24 24"><path d="M20 10c0 6-8 12-8 12S4 16 4 10a8 8 0 0 1 16 0z" /><circle cx="12" cy="10" r="3" /></symbol>
          <symbol id="ig" viewBox="0 0 24 24"><rect x="2" y="2" width="20" height="20" rx="5" /><circle cx="12" cy="12" r="4" /><path d="M17.5 6.5h.01" /></symbol>
          <symbol id="in" viewBox="0 0 24 24"><path d="M16 8a6 6 0 0 1 6 6v7h-4v-7a2 2 0 0 0-4 0v7h-4v-7a6 6 0 0 1 6-6zM2 9h4v12H2z" /><circle cx="4" cy="4" r="2" /></symbol>
          <symbol id="gh" viewBox="0 0 24 24"><path d="M15 22v-4a4.8 4.8 0 0 0-1-3.5c3 0 6-2 6-5.5.1-1.3-.2-2.6-1-3.8.3-1.1.3-2.3 0-3.5 0 0-1 0-3 1.5a13.4 13.4 0 0 0-7 0C6 2 5 2 5 2c-.3 1.200-.3 2.400 0 3.500A5.400 5.400 0 0 0 4 9c0 3.500 3 5.500 6 5.500-.4.500-.8 1.300-.9 2.500V22M9 18c-4.500 2-5-2-7-2" /></symbol>
          <symbol id="globe" viewBox="0 0 24 24"><circle cx="12" cy="12" r="10" /><path d="M2 12h20M12 2a15 15 0 0 1 0 20 15 15 0 0 1 0-20" /></symbol>
          <symbol id="tree" viewBox="0 0 24 24"><path d="M21 12h-8M21 6H8M21 18h-8M3 6v4c0 1.1.9 2 2 2h3M3 10v6c0 1.1.9 2 2 2h3" /></symbol>
          <symbol id="map" viewBox="0 0 24 24"><path d="M14.1 5.55a2 2 0 0 0 1.8 0l3.66-1.83A1 1 0 0 1 21 4.62v12.76a1 1 0 0 1-.55.9l-4.55 2.28a2 2 0 0 1-1.79 0l-4.2-2.1a2 2 0 0 0-1.79 0l-3.66 1.83A1 1 0 0 1 3 19.38V6.62a1 1 0 0 1 .55-.9l4.55-2.28a2 2 0 0 1 1.79 0zM15 5.76v15M9 3.24v15" /></symbol>
          <symbol id="route" viewBox="0 0 24 24"><circle cx="6" cy="19" r="3" /><path d="M9 19h8.5a3.5 3.5 0 0 0 0-7h-11a3.5 3.5 0 0 1 0-7H15" /><circle cx="18" cy="5" r="3" /></symbol>
          <symbol id="sliders" viewBox="0 0 24 24"><path d="M10 5H3M12 19H3M14 3v4M16 17v4M21 12h-9M21 19h-5M21 5h-7M8 10v4M8 12H3" /></symbol>
          <symbol id="brain" viewBox="0 0 24 24"><path d="M12 18V5M15 13a4.17 4.17 0 0 1-3-4 4.17 4.17 0 0 1-3 4M17.6 6.5A3 3 0 1 0 12 5a3 3 0 1 0-5.6 1.5M18 5.13a4 4 0 0 1 2.52 5.77M18 18a4 4 0 0 0 2-7.46M19.97 17.48A4 4 0 1 1 12 18a4 4 0 1 1-7.97-.52M6 18a4 4 0 0 1-2-7.46M6 5.13a4 4 0 0 0-2.52 5.77" /></symbol>
          <symbol id="layers" viewBox="0 0 24 24"><path d="M12.83 2.18a2 2 0 0 0-1.66 0L2.6 6.08a1 1 0 0 0 0 1.83l8.58 3.91a2 2 0 0 0 1.66 0l8.58-3.9a1 1 0 0 0 0-1.83zM2 12a1 1 0 0 0 .58.91l8.6 3.91a2 2 0 0 0 1.65 0l8.58-3.9A1 1 0 0 0 22 12M2 17a1 1 0 0 0 .58.91l8.6 3.91a2 2 0 0 0 1.65 0l8.58-3.9A1 1 0 0 0 22 17" /></symbol>
          <symbol id="heart" viewBox="0 0 24 24"><path fill="currentColor" stroke="none" d="M12 21s-8-5.2-8-11a4.5 4.5 0 0 1 8-2.8A4.5 4.5 0 0 1 20 10c0 5.800-8 11-8 11z" /></symbol>
        </defs>
      </svg>

      <header className="nav">
        <a className="brand" href="#top">
          <span className="logo"><svg className="i"><use href="#cap" /></svg></span>
          [SITE NAME]
        </a>
        <nav className="links" aria-label="Primary">
          <a className="on" href="#top" aria-current="page"><svg className="i"><use href="#home" /></svg>Home</a>
          <Link href="/practice"><svg className="i"><use href="#book" /></svg>Practice Questions</Link>
          <Link href="/papers"><svg className="i"><use href="#file" /></svg>Papers</Link>
          <Link href="/syllabus"><svg className="i"><use href="#marked" /></svg>Syllabus</Link>
        </nav>
        <div className="ctrl">
          <button
            className="toggle"
            id="theme"
            role="switch"
            aria-checked={theme === "dark"}
            aria-label={`Switch to ${theme === "dark" ? "light" : "dark"} mode`}
            onClick={toggleTheme}
          >
            <span className="rings"></span>
            <svg className="clouds" viewBox="0 0 64 32" aria-hidden="true">
              <path fill="#b9dcf2" d="M34 32c0-3 2.500-5 5-4.200 1-3.300 5.500-4.800 8-2.200 2.300-2.500 6.500-2 7.800 1 2.500-.3 5 1.500 5.200 4.200V32z" />
              <path fill="#effaff" d="M26 32c0-3.500 3-6 6.500-5 1.500-4 7-5.500 10-2.200 2.500-3 8-2.500 9.500 1.200 3.500-.5 6 1.500 6.500 6z" />
            </svg>
            <svg className="stars" viewBox="0 0 64 32" fill="#fff" aria-hidden="true">
              <path transform="translate(9 9) scale(1.1)" d="M0-3 .8-.8 3 0 .8 .8 0 3-.8 .8-3 0-.8-.8z" />
              <path transform="translate(17 6) scale(0.8)" d="M0-3 .8-.8 3 0 .8 .8 0 3-.8 .8-3 0-.8-.8z" />
              <path transform="translate(7 21) scale(0.9)" d="M0-3 .8-.8 3 0 .8 .8 0 3-.8 .8-3 0-.8-.8z" />
              <path transform="translate(15 25) scale(1)" d="M0-3 .8-.8 3 0 .8 .8 0 3-.8 .8-3 0-.8-.8z" />
              <path transform="translate(22 15) scale(0.6)" d="M0-3 .8-.8 3 0 .8 .8 0 3-.8 .8-3 0-.8-.8z" />
              <path transform="translate(24 27) scale(0.5)" d="M0-3 .8-.8 3 0 .8 .8 0 3-.8 .8-3 0-.8-.8z" />
              <path transform="translate(27 7) scale(0.5)" d="M0-3 .8-.8 3 0 .8 .8 0 3-.8 .8-3 0-.8-.8z" />
              <circle cx="4" cy="14" r=".6" />
              <circle cx="12" cy="17" r=".5" />
              <circle cx="20" cy="22" r=".5" />
            </svg>
            <span className="knob"><i className="sun"></i><i className="moon"></i></span>
          </button>
        </div>
      </header>

      <main id="top">
        <section className="hero">
          <span className="sym" style={{ left: "330px", top: "300px", fontSize: "30px" }} aria-hidden="true">+</span>
          <span className="sym" style={{ left: "215px", top: "160px", fontSize: "45px" }} aria-hidden="true">?</span>
          <span className="sym" style={{ left: "1144px", top: "130px", fontSize: "38px" }} aria-hidden="true">∑</span>
          <span className="sym" style={{ left: "1104px", top: "540px", fontSize: "22px" }} aria-hidden="true">ƒ(x)</span>
          <span className="sym" style={{ left: "173px", top: "466px", fontSize: "22px" }} aria-hidden="true">x² + y²</span>

          <div className="hbrand">
            <span className="logo lg"><svg className="i"><use href="#cap" /></svg></span>
            <span>[SITE <span className="grad">NAME]</span></span>
          </div>

          <h1>
            <span className="grad">Practice Smarter,</span>
            <span>Topic by Topic.</span>
          </h1>

          <p className="sub">
            Module-wise and topic-wise previous-year questions, built for your campus.
          </p>

          {/* Search Bar with Autocomplete Dropdown */}
          <div className="home-search-wrap" ref={searchContainerRef}>
            <div className={`search ${selectedCourse ? "is-selected" : ""}`}>
              <svg className="i">
                <use href="#search" />
              </svg>
              <input
                ref={inputRef}
                type="text"
                value={searchQuery}
                onChange={(e) => {
                  setSearchQuery(e.target.value);
                  if (selectedCourse) setSelectedCourse(null);
                  setIsDropdownOpen(true);
                  setHighlightedIndex(0);
                }}
                onFocus={() => setIsDropdownOpen(true)}
                onKeyDown={handleKeyDown}
                placeholder="Search for a course (e.g. BACSE201, Data Structures)"
                aria-label="Search courses by code or name"
                role="combobox"
                aria-expanded={isDropdownOpen}
                aria-autocomplete="list"
                autoComplete="off"
              />

              {/* Clear search / selection button */}
              {(searchQuery.length > 0 || selectedCourse) && (
                <button
                  type="button"
                  className="search-clear-btn"
                  onClick={handleClear}
                  title="Clear search"
                  aria-label="Clear course search"
                >
                  <svg
                    viewBox="0 0 24 24"
                    width="14"
                    height="14"
                    stroke="currentColor"
                    fill="none"
                    strokeWidth="2.5"
                    strokeLinecap="round"
                  >
                    <path d="M18 6L6 18M6 6l12 12" />
                  </svg>
                </button>
              )}

              <span className="div"></span>

              {/* Voice search button */}
              <button
                type="button"
                className={`search-mic-btn ${isListening ? "listening" : ""}`}
                onClick={handleVoiceSearch}
                title={isListening ? "Listening..." : "Voice search"}
                aria-label="Voice search"
              >
                <svg className="i" style={{ fontSize: "20px" }}>
                  <use href="#mic" />
                </svg>
              </button>
            </div>

            {/* Dropdown Results */}
            {isDropdownOpen && (
              <div className="home-search-dropdown" role="listbox">
                <div className="home-search-dropdown-header">
                  <span>
                    {loadingCourses
                      ? "Loading..."
                      : `${filteredCourses.length} ${
                          filteredCourses.length === 1 ? "course" : "courses"
                        } found`}
                  </span>
                  <span>Click to select course</span>
                </div>
                {loadingCourses ? (
                  <div className="home-search-empty">
                    Loading courses from database...
                  </div>
                ) : filteredCourses.length > 0 ? (
                  filteredCourses.map((c, idx) => {
                    const isSelected = selectedCourse?.code === c.code;
                    const isHighlighted = highlightedIndex === idx;
                    return (
                      <button
                        key={c.code}
                        type="button"
                        className={`home-search-item ${
                          isSelected ? "selected" : ""
                        } ${isHighlighted ? "highlighted" : ""}`}
                        onClick={() => handleSelectCourse(c)}
                        onMouseEnter={() => setHighlightedIndex(idx)}
                        role="option"
                        aria-selected={isSelected}
                      >
                        <div className="home-search-item-info">
                          <span className="home-search-code-badge">{c.code}</span>
                          <span className="home-search-name">{c.name}</span>
                        </div>
                        {c.count != null && c.count > 0 && (
                          <span className="home-search-count-badge">
                            {c.count} questions
                          </span>
                        )}
                      </button>
                    );
                  })
                ) : (
                  <div className="home-search-empty">
                    {courses.length === 0 ? (
                      "No courses found in database."
                    ) : (
                      <>
                        No courses found matching <strong>&ldquo;{searchQuery}&rdquo;</strong>.
                        <br />
                        <small
                          style={{
                            color: "var(--text2)",
                            marginTop: "4px",
                            display: "inline-block",
                          }}
                        >
                          Try searching by course code (e.g. BACSE201) or title keyword.
                        </small>
                      </>
                    )}
                  </div>
                )}
              </div>
            )}

            {/* Selected Course Indicator Banner */}
            {selectedCourse && (
              <div className="home-selected-banner" role="status">
                <div>
                  <span>Selected:&nbsp;</span>
                  <span className="badge">{selectedCourse.code}</span>&nbsp;
                  <span>{selectedCourse.name}</span>
                </div>
                <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                  <span className="action-prompt">Choose an option below:</span>
                  <button
                    type="button"
                    className="clear-link"
                    onClick={handleClear}
                    title="Change selected course"
                  >
                    Change
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* 3 Quick Action Buttons (dynamically link to selected course result) */}
          <div className={`quick ${selectedCourse ? "has-selected" : ""}`}>
            <Link
              href={practiceHref}
              title={
                selectedCourse
                  ? `Practice questions for ${selectedCourse.code}`
                  : "Practice Questions"
              }
            >
              <svg className="i"><use href="#book" /></svg>
              <span>Practice Questions</span>
              {selectedCourse && (
                <span className="course-tag">{selectedCourse.code}</span>
              )}
              <svg className="i"><use href="#ne" /></svg>
            </Link>

            <Link
              href={papersHref}
              title={
                selectedCourse
                  ? `Download past papers for ${selectedCourse.code}`
                  : "Download Papers"
              }
            >
              <svg className="i"><use href="#dl" /></svg>
              <span>Download Papers</span>
              {selectedCourse && (
                <span className="course-tag">{selectedCourse.code}</span>
              )}
              <svg className="i"><use href="#ne" /></svg>
            </Link>

            <Link
              href={syllabusHref}
              title={
                selectedCourse
                  ? `View syllabus for ${selectedCourse.code}`
                  : "Syllabus"
              }
            >
              <svg className="i"><use href="#checks" /></svg>
              <span>Syllabus</span>
              {selectedCourse && (
                <span className="course-tag">{selectedCourse.code}</span>
              )}
              <svg className="i"><use href="#ne" /></svg>
            </Link>
          </div>
        </section>

        {/* Popular Courses Marquee */}
        <section className="pop" aria-label="Popular courses">
          <div className="label">Popular courses</div>
          <div className="marq" id="marq">
            {marqueeRows.map((row, k) => (
              <div key={k} className={`row${k ? " rev" : ""}`}>
                <div className="track" style={{ left: k ? "12px" : "24px" }}>
                  {[...row, ...row].map((chip, i) => (
                    <button
                      key={i}
                      type="button"
                      className="cc"
                      onClick={() => {
                        handleSelectCourse({ code: chip[0], name: chip[1] });
                        inputRef.current?.scrollIntoView({
                          behavior: "smooth",
                          block: "center",
                        });
                      }}
                      title={`Select ${chip[0]} - ${chip[1]}`}
                    >
                      <b>{chip[0]}</b>
                      <i />
                      {chip[1]}
                    </button>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* Features Grid */}
        <section className="sec feat">
          <div className="head rv">
            <h2>
              <span>Skip the Searching,</span>
              <span className="grad">Start Practising.</span>
            </h2>
            <p>Everything you need to prepare, in one place.</p>
          </div>
          <div className="fgrid">
            <Link
              className="fc rv"
              href="/practice"
              style={
                {
                  "--d": "0",
                  "--hc": "#3b82f6",
                  "--w1": "rgba(59,130,246,.2)",
                  "--w2": "rgba(34,211,238,.2)",
                  "--glow": "rgba(59,130,246,.25)",
                  "--hb": "#2c64ad",
                  "--hr": "#3d97dc",
                  "--ha": "#22d3ee",
                  "--hg": "#0b1020",
                  "--hl": "#9fd6f5",
                  "--ac": "#22d3ee",
                  "--ph": "0s",
                } as React.CSSProperties
              }
            >
              <span className="fi">
                <svg viewBox="0 0 88 88" aria-hidden="true">
                  <path fill="var(--r)" d="M10 16h54a4 4 0 0 1 4 4v4a4 4 0 0 1-4 4H10a4 4 0 0 1-4-4v-4a4 4 0 0 1 4-4z" />
                  <path fill="var(--b)" d="M10 30h54L46 50v22l-9 5V50z" />
                  <circle cx="62" cy="58" r="15" fill="var(--a)" />
                  <text x="62" y="65" textAnchor="middle" fontSize="20" fontWeight="700" fontFamily="Inter,sans-serif" fill="var(--g)">?</text>
                </svg>
              </span>
              <div>
                <h3>Filter Questions</h3>
                <p>Pick a course, module or topic and filter by slot, semester and exam type.</p>
              </div>
              <svg className="i"><use href="#ne" /></svg>
            </Link>

            <Link
              className="fc rv"
              href="/papers"
              style={
                {
                  "--d": "1",
                  "--hc": "#34d399",
                  "--w1": "rgba(52,211,153,.2)",
                  "--w2": "rgba(45,212,191,.2)",
                  "--glow": "rgba(52,211,153,.25)",
                  "--hb": "#1f7a63",
                  "--hr": "#2fa98a",
                  "--ha": "#2dd4a8",
                  "--hg": "#0b1020",
                  "--hl": "#5fe0b8",
                  "--ac": "#2dd4bf",
                  "--ph": ".45s",
                } as React.CSSProperties
              }
            >
              <span className="fi">
                <svg viewBox="0 0 88 88" aria-hidden="true">
                  <path fill="var(--b)" d="M22 10h28l16 16v36a6 6 0 0 1-6 6H22a6 6 0 0 1-6-6V16a6 6 0 0 1 6-6z" />
                  <path fill="var(--r)" d="M50 10l16 16H56a6 6 0 0 1-6-6z" />
                  <rect x="24" y="34" width="18" height="4" rx="2" fill="var(--l)" />
                  <rect x="24" y="44" width="12" height="4" rx="2" fill="var(--l)" />
                  <circle cx="60" cy="60" r="15" fill="var(--a)" />
                  <path d="M60 52v12m-5-5 5 5 5-5M53 70h14" fill="none" stroke="var(--g)" strokeWidth="2.6" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              </span>
              <div>
                <h3>Get Past Papers</h3>
                <p>Download full CAT 1, CAT 2 and FAT papers, organised by year and slot.</p>
              </div>
              <svg className="i"><use href="#ne" /></svg>
            </Link>

            <Link
              className="fc rv"
              href="/syllabus"
              style={
                {
                  "--d": "2",
                  "--hc": "#8b5cf6",
                  "--w1": "rgba(139,92,246,.2)",
                  "--w2": "rgba(232,121,249,.2)",
                  "--glow": "rgba(139,92,246,.25)",
                  "--hb": "#5b3fc4",
                  "--hr": "#7d5be0",
                  "--ha": "#e879f9",
                  "--hg": "#241048",
                  "--hl": "#e7d3ff",
                  "--ac": "#e879f9",
                  "--ph": ".9s",
                } as React.CSSProperties
              }
            >
              <span className="fi">
                <svg viewBox="0 0 88 88" aria-hidden="true">
                  <rect x="18" y="14" width="44" height="60" rx="7" fill="var(--b)" />
                  <rect x="28" y="8" width="24" height="13" rx="6.5" fill="var(--a)" />
                  <g fill="none" stroke="var(--l)" strokeWidth="2.6" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M26 33l3 3 6-6M26 45l3 3 6-6M26 57l3 3 6-6" />
                    <path d="M42 33h12M42 45h12M42 57h12" />
                  </g>
                </svg>
              </span>
              <div>
                <h3>Get Syllabus</h3>
                <p>See exactly what&apos;s in each module before you start preparing.</p>
              </div>
              <svg className="i"><use href="#ne" /></svg>
            </Link>

            <a
              className="fc rv"
              href="#"
              style={
                {
                  "--d": "3",
                  "--hc": "#fbbf24",
                  "--w1": "rgba(251,191,36,.2)",
                  "--w2": "rgba(251,146,60,.2)",
                  "--glow": "rgba(251,191,36,.25)",
                  "--hb": "#b8680f",
                  "--hr": "#d98a1c",
                  "--ha": "#fbbf24",
                  "--hg": "#3d2306",
                  "--hl": "#ffe3a3",
                  "--ac": "#fbbf24",
                  "--ph": "1.35s",
                } as React.CSSProperties
              }
            >
              <span className="fi">
                <svg viewBox="0 0 88 88" aria-hidden="true">
                  <path fill="var(--b)" d="M22 10h28l16 16v36a6 6 0 0 1-6 6H22a6 6 0 0 1-6-6V16a6 6 0 0 1 6-6z" />
                  <path fill="var(--r)" d="M50 10l16 16H56a6 6 0 0 1-6-6z" />
                  <path d="M24 38h14M31 31v14" stroke="var(--l)" strokeWidth="3" strokeLinecap="round" />
                  <rect x="52" y="52" width="4" height="26" rx="2" fill="var(--a)" />
                  <path d="M56 52h20l-5 8 5 8H56z" fill="var(--a)" />
                </svg>
              </span>
              <div>
                <h3>Contribute</h3>
                <p>Send a paper, or report an incorrect question or other issue.</p>
              </div>
              <svg className="i"><use href="#ne" /></svg>
            </a>
          </div>
        </section>

        {/* Why section */}
        <section className="sec why">
          <div className="head rv">
            <h2>
              Why&nbsp;<em className="grad">[SITE NAME]</em>?
            </h2>
            <p>
              Most platforms hand you a full paper PDF and wish you luck. We let you practise exactly what you just studied.
            </p>
          </div>
          <div className="wrap">
            <div className="tiles">
              <div className="tile core rv" style={{ "--c": "#5595ff", "--c2": "#a183ff", "--d": "0" } as React.CSSProperties}>
                <div className="th">
                  <span className="ib"><svg className="i"><use href="#tree" /></svg></span>
                  <h3>Topic-wise and module-wise practice</h3>
                </div>
                <p>Practise questions from exactly the topic or module you just studied, without scanning an entire paper.</p>
                <span className="pill">Core differentiator</span>
              </div>
              <div className="tile rv" style={{ "--c": "#43c99b", "--c2": "#43cde4", "--d": "1" } as React.CSSProperties}>
                <div className="th">
                  <span className="ib"><svg className="i"><use href="#map" /></svg></span>
                  <h3>Campus-specific question banks</h3>
                </div>
                <p>Questions organised separately for VIT Chennai, Vellore, AP and more, since patterns differ by campus.</p>
              </div>
              <div className="tile rv" style={{ "--c": "#a183ff", "--c2": "#e885b9", "--d": "2" } as React.CSSProperties}>
                <div className="th">
                  <span className="ib"><svg className="i"><use href="#route" /></svg></span>
                  <h3>Curriculum-aware mapping</h3>
                </div>
                <p>Older questions are mapped to topics in the new curriculum, so past papers stay useful.</p>
              </div>
              <div className="tile rv" style={{ "--c": "#e8b452", "--c2": "#f59e63", "--d": "3" } as React.CSSProperties}>
                <div className="th">
                  <span className="ib"><svg className="i"><use href="#sliders" /></svg></span>
                  <h3>Advanced filters</h3>
                </div>
                <p>Filter by CAT 1, CAT 2 or FAT, semester, year, slot, marks, difficulty and question type.</p>
              </div>
              <div className="tile rv" style={{ "--c": "#e885b9", "--c2": "#a183ff", "--d": "4" } as React.CSSProperties}>
                <div className="th">
                  <span className="ib"><svg className="i"><use href="#brain" /></svg></span>
                  <h3>Built for HOTS and scenario-based questions</h3>
                </div>
                <p>Questions are tagged as conceptual, application-based or higher-order thinking, for reasoning-heavy exams.</p>
              </div>
              <div className="tile rv" style={{ "--c": "#43cde4", "--c2": "#5595ff", "--d": "5" } as React.CSSProperties}>
                <div className="th">
                  <span className="ib"><svg className="i"><use href="#layers" /></svg></span>
                  <h3>Practice and full papers in one place</h3>
                </div>
                <p>Practise question by question, then switch to full-paper downloads for exam-style prep.</p>
              </div>
              <div className="stats">
                <div className="stat"><b className="grad">100+</b><span>Questions tagged</span></div>
                <div className="stat"><b className="grad">10+</b><span>Courses</span></div>
                <div className="stat"><b className="grad">1</b><span>Campuses</span></div>
              </div>
            </div>
            <div className="illus rv" aria-hidden="true">
              <div className="glow"></div>
              <div className="card c1"></div>
              <div className="card c2"></div>
              <div className="card c3">
                <div className="m"><span className="q">?</span>TOPIC PRACTICE</div>
                <div style={{ marginTop: "16px" }}>
                  <div className="ln" style={{ width: "175px", opacity: ".6" }}></div>
                  <div className="ln" style={{ width: "153px", opacity: ".3" }}></div>
                  <div className="ln" style={{ width: "112px", opacity: ".15" }}></div>
                </div>
                <div style={{ marginTop: "16px", display: "flex", alignItems: "center", gap: "10px" }}>
                  <span style={{ width: "22px", height: "22px", borderRadius: "50%", background: "#43c99b" }}></span>
                  <div className="ln" style={{ width: "112px", height: "4px", margin: "0", background: "#43c99b", opacity: ".65" }}></div>
                </div>
              </div>
              <span className="tag" style={{ "--c": "#5595ff", left: "33px", top: "35px" } as React.CSSProperties}>CAT 1</span>
              <span className="tag" style={{ "--c": "#43cde4", left: "262px", top: "79px", animationDelay: "-2s" } as React.CSSProperties}>Slot A1</span>
              <span className="tag" style={{ "--c": "#e885b9", left: "267px", top: "351px", animationDelay: "-4s" } as React.CSSProperties}>HOTS</span>
              <span className="tag" style={{ "--c": "#a183ff", left: "84px", top: "374px", animationDelay: "-1s" } as React.CSSProperties}>Module 3</span>
            </div>
          </div>
        </section>

        {/* Creator / Footer Section */}
        <section className="made">
          <div className="cs">
            <div className="rule rv">
              <h2>
                Made With <svg className="heart"><use href="#heart" /></svg>
              </h2>
            </div>
            <div className="cc2 rv">
              <div className="por">
                <span className="ph" role="img" aria-label="Photo of Varun"></span>
              </div>
              <div>
                <h3 className="grad">Varun</h3>
                <p className="r">Student Developer and Designer</p>
                <p style={{ fontSize: "16px" }}>VIT Chennai</p>
                <p>Built by a student, for students.</p>
                <div className="soc">
                  Find me on
                  <a className="sb" href="https://www.instagram.com/mostly_average_boi/" target="_blank" rel="noopener noreferrer" data-tip="Instagram" aria-label="Instagram">
                    <span className="c"></span><svg className="i"><use href="#ig" /></svg>
                  </a>
                  <a className="sb" href="https://www.linkedin.com/in/varun-s-801a59301/" target="_blank" rel="noopener noreferrer" data-tip="LinkedIn" aria-label="LinkedIn">
                    <span className="c"></span><svg className="i"><use href="#in" /></svg>
                  </a>
                  <a className="sb" href="https://github.com/Varun-CodeSlayer" target="_blank" rel="noopener noreferrer" data-tip="GitHub" aria-label="GitHub">
                    <span className="c"></span><svg className="i"><use href="#gh" /></svg>
                  </a>
                  <a className="sb" href="https://student-portfolio-varun.vercel.app/#contact" target="_blank" rel="noopener noreferrer" data-tip="Portfolio" aria-label="Portfolio">
                    <span className="c"></span><svg className="i"><use href="#globe" /></svg>
                  </a>
                </div>
              </div>
            </div>
          </div>
          <footer>
            <div className="fr">
              <div className="credit">
                <span className="mini"><span className="ph" role="img" aria-label="Photo of Varun"></span></span>
                Made by Varun
              </div>
              <div className="mid">
                <div className="brand">
                  <span className="logo"><svg className="i"><use href="#cap" /></svg></span>
                  [SITE NAME]
                </div>
                <div className="fl">
                  <a href="#">Privacy</a>
                  <s>|</s>
                  <a href="#">Terms</a>
                  <s>|</s>
                  <a href="#">Contact</a>
                  <s>|</s>
                  <a href="#">Report an Issue</a>
                </div>
              </div>
              <div className="conn">
                <a className="sb s" href="#top" data-tip="Back to top" aria-label="Back to top">
                  <span className="c"></span><svg className="i"><use href="#up" /></svg>
                </a>
              </div>
            </div>
            <p className="copy">(c) 2026 [SITE NAME]. Not affiliated with VIT. Question papers belong to their respective owners.</p>
          </footer>
        </section>
      </main>
    </>
  );
}

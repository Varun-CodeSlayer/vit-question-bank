"use client";

import React, { useState, useRef, useEffect } from "react";
import {
  Question,
  FACETS,
  TopicMapEntry,
  formatFacetValue,
  isQuestionMatching,
} from "@/lib/question-data";

export interface QuestionFiltersProps {
  questions: Question[];
  activeFilters: Record<string, Set<string>>;
  onFilterChange: (key: string, value: string, checked: boolean) => void;
  onClearFilters: () => void;
  searchQuery: string;
  onSearchChange: (q: string) => void;
  totalMatches: number;
  topicsMap?: Record<string, TopicMapEntry>;
}

export default function QuestionFilters({
  questions,
  activeFilters,
  onFilterChange,
  onClearFilters,
  searchQuery,
  onSearchChange,
  totalMatches,
  topicsMap,
}: QuestionFiltersProps) {
  const [openDropdown, setOpenDropdown] = useState<string | null>(null);
  const [drawerOpen, setDrawerOpen] = useState(false);
  const searchInputRef = useRef<HTMLInputElement>(null);

  // Shortcut "/" to focus search
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (
        e.key === "/" &&
        !["INPUT", "TEXTAREA"].includes((document.activeElement?.tagName || "").toUpperCase())
      ) {
        e.preventDefault();
        searchInputRef.current?.focus();
      }
      if (e.key === "Escape") {
        setOpenDropdown(null);
        setDrawerOpen(false);
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, []);

  // Close dropdown on click outside
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (!(e.target as HTMLElement).closest(".fgroup")) {
        setOpenDropdown(null);
      }
    };
    document.addEventListener("click", handleClickOutside);
    return () => document.removeEventListener("click", handleClickOutside);
  }, []);

  // Calculate options count for a facet considering other active filters
  const getFacetOptions = (facetKey: keyof Question) => {
    const allValues = Array.from(
      new Set(
        questions
          .map((q) => (q[facetKey] != null ? String(q[facetKey]) : ""))
          .filter((v) => v.length > 0)
      )
    );

    // Sorting
    if (facetKey === "marks") {
      allValues.sort((a, b) => Number(a) - Number(b));
    } else if (facetKey === "ay") {
      allValues.sort().reverse();
    } else {
      allValues.sort();
    }

    return allValues.map((val) => {
      // count matching questions when this facet is excluded
      const count = questions.filter((q) => {
        if (String(q[facetKey] ?? "") !== val) return false;
        return isQuestionMatching(
          q,
          searchQuery,
          activeFilters,
          facetKey as string,
          topicsMap
        );
      }).length;

      return { val, count };
    });
  };

  const activeCount = Object.values(activeFilters).reduce(
    (acc, set) => acc + (set?.size || 0),
    0
  );

  return (
    <section className="toolbar" aria-label="Search and filters">
      {/* Search Box */}
      <label className={`search ${searchQuery ? "has-q" : ""}`} id="searchBox">
        <svg className="ic" viewBox="0 0 24 24" aria-hidden="true">
          <circle cx="11" cy="11" r="8" />
          <path d="m21 21-4.3-4.3" />
        </svg>
        <span className="sr">Search within this course</span>
        <input
          ref={searchInputRef}
          type="search"
          placeholder="Search within this course..."
          autoComplete="off"
          value={searchQuery}
          onChange={(e) => onSearchChange(e.target.value)}
        />
        {searchQuery ? (
          <button
            className="clear-q"
            type="button"
            aria-label="Clear search"
            onClick={() => {
              onSearchChange("");
              searchInputRef.current?.focus();
            }}
          >
            <svg className="ic" viewBox="0 0 24 24" aria-hidden="true">
              <path d="M18 6 6 18" />
              <path d="m6 6 12 12" />
            </svg>
          </button>
        ) : (
          <span className="kbd" aria-hidden="true">
            /
          </span>
        )}
      </label>

      {/* Desktop Facet Triggers */}
      <div className="ftrigs">
        {FACETS.map((f) => {
          const count = activeFilters[f.k as string]?.size || 0;
          const isOpen = openDropdown === f.k;
          const options = isOpen ? getFacetOptions(f.k) : [];

          return (
            <div className="fgroup" key={f.k}>
              <button
                className={`ftrig ${count ? "on" : ""}`}
                type="button"
                aria-haspopup="true"
                aria-expanded={isOpen}
                onClick={() => setOpenDropdown(isOpen ? null : (f.k as string))}
              >
                <span className="l">{f.label}</span>
                {count > 0 && <span className="cnt">{count}</span>}
                <svg className="ic" viewBox="0 0 24 24" aria-hidden="true">
                  {isOpen ? (
                    <path d="m18 15-6-6-6 6" />
                  ) : (
                    <path d="m6 9 6 6 6-6" />
                  )}
                </svg>
              </button>

              {isOpen && (
                <div
                  className="pop"
                  role="group"
                  aria-label={`${f.label} options`}
                >
                  <h4>{f.label}</h4>
                  {options.map(({ val, count: optCount }) => {
                    const isChecked =
                      activeFilters[f.k as string]?.has(val) || false;
                    const isDisabled = optCount === 0 && !isChecked;

                    return (
                      <label
                        key={val}
                        className={`fopt ${isDisabled ? "dis" : ""}`}
                      >
                        <input
                          type="checkbox"
                          checked={isChecked}
                          disabled={isDisabled}
                          onChange={(e) =>
                            onFilterChange(
                              f.k as string,
                              val,
                              e.target.checked
                            )
                          }
                        />
                        <span className="box">
                          <svg
                            className="ic"
                            viewBox="0 0 24 24"
                            aria-hidden="true"
                          >
                            <path d="M20 6 9 17l-5-5" />
                          </svg>
                        </span>
                        <span>{formatFacetValue(f.k, val)}</span>
                        <span className="n">
                          {isDisabled ? "No papers" : optCount}
                        </span>
                      </label>
                    );
                  })}
                  <div className="note">
                    <svg
                      className="ic s"
                      viewBox="0 0 24 24"
                      aria-hidden="true"
                    >
                      <circle cx="12" cy="12" r="10" />
                      <path d="M12 16v-4" />
                      <path d="M12 8h.01" />
                    </svg>
                    <span>
                      Options narrow to papers that match your other filters.
                      Unavailable options are dimmed.
                    </span>
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Mobile Trigger Button */}
      <button
        className={`ftrig fbtn ${activeCount > 0 ? "on" : ""}`}
        type="button"
        aria-haspopup="dialog"
        onClick={() => setDrawerOpen(true)}
      >
        <svg className="ic" viewBox="0 0 24 24" aria-hidden="true">
          <path d="M4 21v-7" />
          <path d="M4 10V3" />
          <path d="M12 21v-9" />
          <path d="M12 8V3" />
          <path d="M20 21v-5" />
          <path d="M20 12V3" />
          <path d="M1 14h6" />
          <path d="M9 8h6" />
          <path d="M17 16h6" />
        </svg>
        <span className="l">Filters</span>
        {activeCount > 0 && <span className="cnt">{activeCount}</span>}
      </button>

      {/* Active Filter Chips */}
      <div className="chips" aria-live="polite">
        {activeCount > 0 || searchQuery ? (
          <>
            <span className="lbl">Active filters</span>
            {FACETS.map((f) => {
              const selected = activeFilters[f.k as string];
              if (!selected || selected.size === 0) return null;
              return Array.from(selected).map((val) => (
                <span className="chip" key={`${f.k}-${val}`}>
                  <em>{f.label}:</em>{" "}
                  <b>{formatFacetValue(f.k, val)}</b>
                  <button
                    type="button"
                    aria-label={`Remove ${f.label} ${val}`}
                    onClick={() => onFilterChange(f.k as string, val, false)}
                  >
                    <svg className="ic" viewBox="0 0 24 24" aria-hidden="true">
                      <path d="M18 6 6 18" />
                      <path d="m6 6 12 12" />
                    </svg>
                  </button>
                </span>
              ));
            })}
            <button
              className="link"
              type="button"
              onClick={() => {
                onClearFilters();
                onSearchChange("");
              }}
            >
              <svg className="ic s" viewBox="0 0 24 24" aria-hidden="true">
                <path d="M18 6 6 18" />
                <path d="m6 6 12 12" />
              </svg>
              Clear all
            </button>
            <span className="status" role="status">
              · {totalMatches} of {questions.length} questions match
            </span>
          </>
        ) : (
          <span className="status" role="status">
            Showing all {questions.length} questions · no filters applied
          </span>
        )}
      </div>

      {/* Mobile Drawer */}
      <div
        className={`ov ${drawerOpen ? "show" : ""}`}
        onClick={() => setDrawerOpen(false)}
      ></div>
      <div
        className={`sheet ${drawerOpen ? "show" : ""}`}
        role="dialog"
        aria-modal="true"
        aria-labelledby="shTitle"
      >
        <div className="grab"></div>
        <div className="sh-h">
          <h2 id="shTitle">Filters</h2>
          <button
            className="btn"
            type="button"
            aria-label="Close filters"
            style={{ width: "38px", padding: 0 }}
            onClick={() => setDrawerOpen(false)}
          >
            <svg className="ic" viewBox="0 0 24 24" aria-hidden="true">
              <path d="M18 6 6 18" />
              <path d="m6 6 12 12" />
            </svg>
          </button>
        </div>
        <div className="sh-b">
          {FACETS.map((f) => {
            const options = getFacetOptions(f.k);
            return (
              <div key={f.k}>
                <h4>{f.label}</h4>
                <div className="ochips">
                  {options.map(({ val, count }) => {
                    const isChecked =
                      activeFilters[f.k as string]?.has(val) || false;
                    const isDisabled = count === 0 && !isChecked;

                    return (
                      <button
                        key={val}
                        className="och"
                        type="button"
                        aria-pressed={isChecked}
                        disabled={isDisabled}
                        onClick={() =>
                          onFilterChange(f.k as string, val, !isChecked)
                        }
                      >
                        {isChecked && (
                          <svg
                            className="ic s"
                            viewBox="0 0 24 24"
                            aria-hidden="true"
                          >
                            <path d="M20 6 9 17l-5-5" />
                          </svg>
                        )}
                        <span>{formatFacetValue(f.k, val)}</span>
                      </button>
                    );
                  })}
                </div>
              </div>
            );
          })}
        </div>
        <div className="sh-f">
          <button className="btn" type="button" onClick={onClearFilters}>
            Clear all
          </button>
          <button
            className="btn accent"
            type="button"
            onClick={() => setDrawerOpen(false)}
          >
            Show {totalMatches} questions
          </button>
        </div>
      </div>
    </section>
  );
}


"use client";

import React, { useState } from "react";
import {
  Question,
  BADGE_ICON,
  BADGE_TEXT,
  getQuestionSourceFile,
} from "@/lib/question-data";

export interface QuestionListProps {
  questions: Question[];
  onClearFilters?: () => void;
  onResetSearch?: () => void;
  isLive?: boolean;
}

const DFA = (
  <svg
    viewBox="0 0 360 120"
    width="100%"
    style={{ maxWidth: "360px" }}
    role="img"
    aria-label="State diagram of a deterministic finite automaton with states q0, q1 and q2"
  >
    <defs>
      <marker
        id="ar"
        viewBox="0 0 10 10"
        refX="9"
        refY="5"
        markerWidth="7"
        markerHeight="7"
        orient="auto-start-reverse"
      >
        <path d="M0 0 10 5 0 10z" fill="currentColor" />
      </marker>
    </defs>
    <g fill="none" stroke="currentColor" strokeWidth="1.6" style={{ color: "var(--t3)" }}>
      <path d="M10 60h42" markerEnd="url(#ar)" />
      <circle cx="76" cy="60" r="24" />
      <circle cx="196" cy="60" r="24" />
      <circle cx="316" cy="60" r="24" />
      <circle cx="316" cy="60" r="19" />
      <path d="M100 60h72" markerEnd="url(#ar)" />
      <path d="M220 60h72" markerEnd="url(#ar)" />
      <path d="M190 36c-4-26 16-26 12 0" markerEnd="url(#ar)" />
    </g>
    <g
      fill="currentColor"
      fontFamily="JetBrains Mono, monospace"
      fontSize="13"
      textAnchor="middle"
      style={{ color: "var(--t3)" }}
    >
      <text x="76" y="65">q0</text>
      <text x="196" y="65">q1</text>
      <text x="316" y="65">q2</text>
      <text x="136" y="50">0</text>
      <text x="256" y="50">1</text>
      <text x="196" y="6">0</text>
    </g>
  </svg>
);

export default function QuestionList({
  questions,
  onClearFilters,
  onResetSearch,
  isLive = false,
}: QuestionListProps) {
  const [shownCount, setShownCount] = useState(4);

  const handlePointerMove = (e: React.PointerEvent<HTMLElement>) => {
    const card = e.currentTarget;
    const rect = card.getBoundingClientRect();
    card.style.setProperty("--mx", `${e.clientX - rect.left}px`);
    card.style.setProperty("--my", `${e.clientY - rect.top}px`);
  };

  if (questions.length === 0) {
    return (
      <div className="empty">
        <div className="oc">
          <svg className="ic" viewBox="0 0 24 24" aria-hidden="true">
            <circle cx="11" cy="11" r="8" />
            <path d="m21 21-4.3-4.3" />
          </svg>
        </div>
        <h3>No questions match these filters</h3>
        <p>
          Try removing a filter or searching for a different topic. Your syllabus
          modules and topics are unchanged.
        </p>
        <div className="btns">
          {onClearFilters && (
            <button
              className="btn accent"
              type="button"
              onClick={onClearFilters}
            >
              Clear all filters
            </button>
          )}
          {onResetSearch && (
            <button
              className="btn"
              type="button"
              onClick={onResetSearch}
            >
              Reset search
            </button>
          )}
        </div>
      </div>
    );
  }

  const visibleQuestions = questions.slice(0, shownCount);
  const progressPercent = Math.min(
    100,
    (visibleQuestions.length / questions.length) * 100
  );

  return (
    <div>
      <div className="qlist">
        {visibleQuestions.map((q, idx) => {
          const badgeIcon = BADGE_ICON[q.cur];
          const badgeText = BADGE_TEXT[q.cur];
          const sourceName = getQuestionSourceFile(q);

          return (
            <article
              key={`${q.t}-${q.n}-${idx}`}
              className="qcard"
              tabIndex={0}
              aria-label={`Question ${q.n}`}
              onPointerMove={handlePointerMove}
            >
              <div className="qh">
                <span className="tag code">{q.n}</span>
                <span className="tag accent">{q.exam}</span>
                <span className="tag">{q.marks} marks</span>
                <span className="tag">{q.qt}</span>
                {q.cognitiveLevel && (
                  <span className="tag">{q.cognitiveLevel}</span>
                )}
                <span className="sp"></span>
                <span className={`badge ${q.cur}`}>
                  <svg className="ic" viewBox="0 0 24 24" aria-hidden="true">
                    {badgeIcon === "check" && <path d="M20 6 9 17l-5-5" />}
                    {badgeIcon === "alert" && (
                      <>
                        <path d="m21.73 18-8-14a2 2 0 0 0-3.48 0l-8 14A2 2 0 0 0 4 21h16a2 2 0 0 0 1.73-3" />
                        <path d="M12 9v4" />
                        <path d="M12 17h.01" />
                      </>
                    )}
                    {badgeIcon === "info" && (
                      <>
                        <circle cx="12" cy="12" r="10" />
                        <path d="M12 16v-4" />
                        <path d="M12 8h.01" />
                      </>
                    )}
                  </svg>
                  {badgeText}
                </span>
              </div>

              {q.img ? (
                <div
                  className="qimg"
                  role="group"
                  aria-label="Question image"
                >
                  {DFA}
                  <span>Scanned question image — placeholder diagram</span>
                </div>
              ) : (
                <p className="qtext">{q.text}</p>
              )}

              <div className="qmeta">
                <span>
                  <svg className="ic s" viewBox="0 0 24 24" aria-hidden="true">
                    <rect x="3" y="4" width="18" height="18" rx="2" />
                    <path d="M16 2v4" />
                    <path d="M8 2v4" />
                    <path d="M3 10h18" />
                  </svg>
                  {q.sem} Semester · {q.ay}
                </span>
                <span>
                  <svg className="ic s" viewBox="0 0 24 24" aria-hidden="true">
                    <circle cx="12" cy="12" r="10" />
                    <path d="M12 6v6l4 2" />
                  </svg>
                  Slot {q.slot}
                </span>
                <span>
                  <svg className="ic s" viewBox="0 0 24 24" aria-hidden="true">
                    <path d="M20 10c0 6-8 12-8 12S4 16 4 10a8 8 0 0 1 16 0" />
                    <circle cx="12" cy="10" r="3" />
                  </svg>
                  {q.campus}
                </span>
              </div>

              <hr />

              <div className="qf">
                <span className="src">
                  <svg className="ic s" viewBox="0 0 24 24" aria-hidden="true">
                    <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
                    <path d="M14 2v6h6" />
                    <path d="M16 13H8" />
                    <path d="M16 17H8" />
                    <path d="M10 9H8" />
                  </svg>
                  {sourceName}
                </span>

                <div className="acts">
                  <button
                    className="btn"
                    type="button"
                    disabled
                    title="Solutions are not available yet"
                  >
                    <svg className="ic" viewBox="0 0 24 24" aria-hidden="true">
                      <rect x="3" y="11" width="18" height="11" rx="2" />
                      <path d="M7 11V7a5 5 0 0 1 10 0v4" />
                    </svg>
                    Show answer
                  </button>
                  {q.paperUrl ? (
                    <a
                      className="btn"
                      href={q.paperUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      aria-label={`View source paper ${sourceName}`}
                    >
                      View source paper
                      <svg className="ic" viewBox="0 0 24 24" aria-hidden="true">
                        <path d="M7 7h10v10" />
                        <path d="M7 17 17 7" />
                      </svg>
                    </a>
                  ) : (
                    <span
                      className="btn"
                      style={{ opacity: 0.7, cursor: "default" }}
                      title="Original paper PDF attachment pending"
                    >
                      Paper: {q.exam} ({q.ay})
                    </span>
                  )}
                </div>
              </div>
            </article>
          );
        })}
      </div>

      <div className="more">
        <span className="status" role="status">
          Showing {visibleQuestions.length} of {questions.length} questions
        </span>
        <div className="bar">
          <i style={{ width: `${progressPercent}%` }}></i>
        </div>
        {visibleQuestions.length < questions.length && (
          <button
            className="btn"
            type="button"
            onClick={() => setShownCount((prev) => prev + 4)}
          >
            Load more questions
            <svg className="ic" viewBox="0 0 24 24" aria-hidden="true">
              <path d="m6 9 6 6 6-6" />
            </svg>
          </button>
        )}
      </div>

      {!isLive && (
        <p className="demo">
          Demonstration data — papers, slots and counts are placeholders.
        </p>
      )}
    </div>
  );
}


"use client";

import React, { useState } from "react";
import {
  Question,
  BADGE_ICON,
  BADGE_TEXT,
  getQuestionSourceFile,
  parseGeneralTableData,
  parseQuestionText,
  parseImageStoragePath,
  GeneralTableData,
} from "@/lib/question-data";
import QuestionImage from "./QuestionImage";

export interface QuestionListProps {
  questions: Question[];
  onClearFilters?: () => void;
  onResetSearch?: () => void;
  isLive?: boolean;
}

function QuestionTable({
  tableData,
  ariaLabel = "Question table data",
}: {
  tableData: GeneralTableData;
  ariaLabel?: string;
}) {
  if (!tableData || tableData.headers.length === 0 || tableData.rows.length === 0) {
    return null;
  }
  const isCompact =
    tableData.headers.length <= 5 &&
    tableData.rows.every((r) => r.every((c) => String(c).length <= 20));

  return (
    <div className="qparts-wrap" role="region" aria-label={ariaLabel}>
      <div className={`qparts-table-wrap ${isCompact ? "compact" : ""}`}>
        <table className="qparts-table">
          <thead>
            <tr>
              {tableData.headers.map((h, hIdx) => {
                const align = tableData.alignments?.[hIdx] || "left";
                return (
                  <th key={hIdx} className={`th-${align}`}>
                    {h}
                  </th>
                );
              })}
            </tr>
          </thead>
          <tbody>
            {tableData.rows.map((row, rIdx) => (
              <tr key={rIdx}>
                {row.map((cell, cIdx) => {
                  const align = tableData.alignments?.[cIdx] || "left";
                  const headerName =
                    tableData.headers[cIdx]?.toLowerCase().trim() || "";
                  const isMarksCol =
                    headerName.includes("mark") || headerName.includes("score");
                  const isPartCol =
                    headerName === "part" || headerName === "subpart";
                  const isBadge =
                    !isMarksCol &&
                    (isPartCol ||
                      (cIdx === 0 &&
                        tableData.headers.length > 1 &&
                        cell !== "—" &&
                        String(cell).length <= 4));

                  const marksText = isMarksCol
                    ? `${cell}${
                        String(cell).toLowerCase().includes("mark")
                          ? ""
                          : " Marks"
                      }`
                    : "";

                  return (
                    <td
                      key={cIdx}
                      className={`td-${align}${isMarksCol ? " td-marks" : ""}`}
                    >
                      {isBadge ? (
                        <span className="qpart-badge">{cell}</span>
                      ) : isMarksCol && cell !== "—" ? (
                        <span
                          className="qpart-marks-chip"
                          style={{
                            background: "transparent",
                            backgroundColor: "transparent",
                            border: "none",
                            boxShadow: "none",
                            outline: "none",
                            padding: 0,
                            color: "var(--accent-text)",
                            fontWeight: 600,
                            fontSize: "13px",
                            whiteSpace: "nowrap",
                            display: "inline-block",
                          }}
                        >
                          {marksText}
                        </span>
                      ) : (
                        <div className="qpart-content">{cell}</div>
                      )}
                    </td>
                  );
                })}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

function getDifficultyClass(diff?: string | null): string {
  if (!diff) return "";
  const d = diff.toLowerCase().trim();
  if (d.includes("easy")) return "diff-easy";
  if (d.includes("med") || d.includes("mod")) return "diff-medium";
  if (d.includes("hard") || d.includes("diff")) return "diff-hard";
  return "";
}

function formatDifficulty(diff: string): string {
  const d = diff.trim();
  return d.charAt(0).toUpperCase() + d.slice(1).toLowerCase();
}

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
          const textSegments = parseQuestionText(q.text);
          const partsTableData = parseGeneralTableData(q.parts);
          const imagePath = (q.hasImageReference || q.img)
            ? parseImageStoragePath(q.imageReference)
            : null;

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
                {q.difficulty && (
                  <span className={`tag ${getDifficultyClass(q.difficulty)}`}>
                    {formatDifficulty(q.difficulty)}
                  </span>
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

              {/* 1. Question Text first (with embedded markdown tables if any) */}
              {textSegments.length > 0 ? (
                textSegments.map((seg, sIdx) => {
                  if (seg.type === "text") {
                    return (
                      <p key={sIdx} className="qtext">
                        {seg.text}
                      </p>
                    );
                  }
                  if (seg.type === "table") {
                    return (
                      <QuestionTable
                        key={sIdx}
                        tableData={seg.data}
                        ariaLabel="Question table"
                      />
                    );
                  }
                  return null;
                })
              ) : (
                q.text && <p className="qtext">{q.text}</p>
              )}

              {/* 2. Parts (JSONB) table generator after question_text */}
              {partsTableData && (
                <QuestionTable
                  tableData={partsTableData}
                  ariaLabel="Question parts table"
                />
              )}

              {/* 3. Image at the bottom after question_text and table */}
              {imagePath ? (
                <QuestionImage
                  key={imagePath}
                  storagePath={imagePath}
                  questionNumber={q.n}
                />
              ) : q.hasImageReference && q.imageReference ? (
                <div className="qimage-note" role="note" aria-label="Image reference note">
                  <svg className="ic s" viewBox="0 0 24 24" aria-hidden="true">
                    <rect width="18" height="18" x="3" y="3" rx="2" ry="2" />
                    <circle cx="9" cy="9" r="2" />
                  </svg>
                  <span>{q.imageReference}</span>
                </div>
              ) : null}

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
                  {q.sourcePages && q.sourcePages.length > 0
                    ? ` · ${
                        q.sourcePages.length > 1
                          ? `Pages ${q.sourcePages.join(", ")}`
                          : `Page ${q.sourcePages[0]}`
                      }`
                    : q.sourcePage
                    ? ` · Page ${q.sourcePage}`
                    : ""}
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


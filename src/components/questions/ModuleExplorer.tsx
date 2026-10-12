"use client";

import React, { useState } from "react";
import { Module, Question } from "@/lib/question-data";
import TopicRow from "./TopicRow";

export interface ModuleExplorerProps {
  modules: Module[];
  questions: Question[];
  filteredQuestions: Question[];
  hasActiveFilters: boolean;
  onSelectTopic: (topicId: string) => void;
  onSelectModule?: (moduleId: string) => void;
  topicIndexMap?: Record<string, string>;
  isLive?: boolean;
}

export default function ModuleExplorer({
  modules,
  questions,
  filteredQuestions,
  hasActiveFilters,
  onSelectTopic,
  onSelectModule,
  topicIndexMap,
  isLive = false,
}: ModuleExplorerProps) {
  const [openModules, setOpenModules] = useState<Set<string>>(new Set());

  const toggleModule = (moduleNum: string) => {
    setOpenModules((prev) => {
      const next = new Set(prev);
      if (next.has(moduleNum)) {
        next.delete(moduleNum);
      } else {
        next.add(moduleNum);
      }
      return next;
    });
  };

  const allOpen = openModules.size === modules.length;
  const toggleAll = () => {
    if (allOpen) {
      setOpenModules(new Set());
    } else {
      setOpenModules(new Set(modules.map((m) => m.n)));
    }
  };

  const totalTopics = modules.reduce((acc, m) => acc + m.topics.length, 0);

  return (
    <div>
      <div className="sec-h">
        <h2>
          Syllabus modules
          <small>
            {modules.length} modules · {totalTopics} topics
          </small>
        </h2>
        <button
          className="link"
          type="button"
          onClick={toggleAll}
          style={{ background: "none", border: 0, cursor: "pointer" }}
        >
          {allOpen ? "Collapse all" : "Expand all"}
          <svg className="ic s" viewBox="0 0 24 24" aria-hidden="true">
            {allOpen ? (
              <path d="m18 15-6-6-6 6" />
            ) : (
              <path d="m6 9 6 6 6-6" />
            )}
          </svg>
        </button>
      </div>

      <div className="mods">
        {modules.map((m) => {
          const topicIds = m.topics.map((t) => t[0]);
          const allInModule = questions.filter(
            (q) => topicIds.includes(q.t) || (m.id && q.moduleId === m.id)
          );
          const filteredInModule = filteredQuestions.filter(
            (q) => topicIds.includes(q.t) || (m.id && q.moduleId === m.id)
          );

          const isOpen = openModules.has(m.n);
          const isZero = hasActiveFilters && filteredInModule.length === 0;
          const metaText =
            `${m.topics.length} topics` +
            (hasActiveFilters
              ? ` · ${filteredInModule.length} of ${allInModule.length} match`
              : "");

          return (
            <article
              key={m.n}
              className={`mod ${isOpen ? "open" : ""} ${isZero ? "zero" : ""}`}
            >
              <div
                className="mh"
                role="button"
                tabIndex={0}
                aria-expanded={isOpen}
                aria-controls={`mp-${m.n}`}
                onClick={() => toggleModule(m.n)}
                onKeyDown={(e) => {
                  if (e.key === "Enter" || e.key === " ") {
                    e.preventDefault();
                    toggleModule(m.n);
                  }
                }}
              >
                <span className="mnum">{m.n}</span>
                <span className="mcopy">
                  <strong>{m.title}</strong>
                  <small>{metaText}</small>
                </span>
                <span className="mtot">
                  <b>
                    {hasActiveFilters
                      ? filteredInModule.length
                      : allInModule.length}
                  </b>
                  <small>Questions</small>
                </span>
                {allInModule.length > 0 && onSelectModule && (
                  <button
                    type="button"
                    className="btn accent"
                    style={{
                      height: "32px",
                      padding: "0 12px",
                      fontSize: "12px",
                      borderRadius: "8px",
                      gap: "6px",
                    }}
                    title={`Practise all ${allInModule.length} questions in Module ${m.n}`}
                    onClick={(e) => {
                      e.stopPropagation();
                      onSelectModule(m.id || m.n);
                    }}
                  >
                    <span>Practise</span>
                    <svg
                      className="ic s"
                      viewBox="0 0 24 24"
                      aria-hidden="true"
                      style={{ width: "12px", height: "12px" }}
                    >
                      <path d="M5 12h14" />
                      <path d="m12 5 7 7-7 7" />
                    </svg>
                  </button>
                )}
                <span className="tgl">
                  <svg className="ic" viewBox="0 0 24 24" aria-hidden="true">
                    <path d="m6 9 6 6 6-6" />
                  </svg>
                </span>
              </div>

              <div
                className="panelwrap"
                id={`mp-${m.n}`}
                role="region"
                aria-label={`${m.title} topics`}
              >
                <div>
                  <div className="topics">
                    {allInModule.length > 0 && onSelectModule && (
                      <button
                        className="trow"
                        type="button"
                        onClick={() => onSelectModule(m.id || m.n)}
                        style={{
                          background: "var(--accent-soft)",
                          border: "1px solid var(--accent)",
                          marginBottom: "4px",
                        }}
                      >
                        <span
                          className="ix"
                          style={{
                            color: "var(--accent-text)",
                            fontWeight: 700,
                          }}
                        >
                          ALL
                        </span>
                        <span className="tt" style={{ fontWeight: 600 }}>
                          Practise all questions in Module {m.n}
                        </span>
                        <span className="tc">
                          {hasActiveFilters
                            ? `${filteredInModule.length} of ${allInModule.length} questions`
                            : `${allInModule.length} questions`}
                        </span>
                        <span className="act" style={{ width: "116px" }}>
                          <span style={{ opacity: 1 }}>Practise module</span>
                          <svg
                            className="ic"
                            viewBox="0 0 24 24"
                            aria-hidden="true"
                          >
                            <path d="M5 12h14" />
                            <path d="m12 5 7 7-7 7" />
                          </svg>
                        </span>
                      </button>
                    )}

                    {m.topics.map(([topicId, topicTitle]) => {
                      const topicTotal = allInModule.filter(
                        (q) => q.t === topicId
                      ).length;
                      const topicFiltered = filteredInModule.filter(
                        (q) => q.t === topicId
                      ).length;
                      const displayIndex = topicIndexMap?.[topicId];

                      return (
                        <TopicRow
                          key={topicId}
                          id={topicId}
                          title={topicTitle}
                          totalQuestions={topicTotal}
                          filteredQuestions={topicFiltered}
                          hasActiveFilters={hasActiveFilters}
                          onSelectTopic={onSelectTopic}
                          displayIndex={displayIndex}
                        />
                      );
                    })}
                  </div>
                </div>
              </div>
            </article>
          );
        })}
      </div>

      {!isLive && (
        <p className="demo">
          Demonstration data — question counts are placeholders.
        </p>
      )}
    </div>
  );
}

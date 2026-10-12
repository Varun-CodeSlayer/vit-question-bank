"use client";

import React from "react";

export interface TopicRowProps {
  id: string;
  title: string;
  totalQuestions: number;
  filteredQuestions: number;
  hasActiveFilters: boolean;
  onSelectTopic: (id: string) => void;
  displayIndex?: string;
}

export default function TopicRow({
  id,
  title,
  totalQuestions,
  filteredQuestions,
  hasActiveFilters,
  onSelectTopic,
  displayIndex,
}: TopicRowProps) {
  const isZero = hasActiveFilters && filteredQuestions === 0;

  const countText = hasActiveFilters
    ? filteredQuestions > 0
      ? `${filteredQuestions} of ${totalQuestions} questions`
      : "No matches"
    : `${totalQuestions} questions`;

  return (
    <button
      className={`trow ${isZero ? "zero" : ""}`}
      type="button"
      onClick={() => onSelectTopic(id)}
    >
      <span className="ix">{displayIndex || id}</span>
      <span className="tt">{title}</span>
      <span className="tc">{countText}</span>
      <span className="act">
        <span>Practise topic</span>
        <svg className="ic" viewBox="0 0 24 24" aria-hidden="true">
          <path d="M5 12h14" />
          <path d="m12 5 7 7-7 7" />
        </svg>
      </span>
    </button>
  );
}


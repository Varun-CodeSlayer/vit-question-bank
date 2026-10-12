"use client";

import React from "react";
import Link from "next/link";
import { CourseInfo, Question, Module } from "@/lib/question-data";

export interface CourseOverviewProps {
  course: CourseInfo;
  questions: Question[];
  modules: Module[];
  viewMode?: "overview" | "topic" | "module";
  activeTopic?: {
    id: string;
    title: string;
    mod: Module;
  } | null;
  activeModule?: Module | null;
  onBackToOverview?: () => void;
  isLive?: boolean;
}

export default function CourseOverview({
  course,
  questions,
  modules,
  viewMode = "overview",
  activeTopic,
  activeModule,
  onBackToOverview,
  isLive = false,
}: CourseOverviewProps) {
  const totalTopics = modules.reduce((acc, m) => acc + m.topics.length, 0);

  const activeModuleQuestionCount = activeModule
    ? questions.filter((q) => {
        const topicIds = activeModule.topics.map((t) => t[0]);
        return (
          topicIds.includes(q.t) || (activeModule.id && q.moduleId === activeModule.id)
        );
      }).length
    : 0;

  return (
    <>
      {/* Breadcrumb Navigation */}
      <nav className="crumbs" aria-label="Breadcrumb">
        <Link href="/">Home</Link>
        <svg className="ic" viewBox="0 0 24 24" aria-hidden="true">
          <path d="m9 18 6-6-6-6" />
        </svg>
        <Link href="/practice">Practice Questions</Link>
        <svg className="ic" viewBox="0 0 24 24" aria-hidden="true">
          <path d="m9 18 6-6-6-6" />
        </svg>
        {viewMode === "module" && activeModule ? (
          <>
            <button
              type="button"
              className="link"
              onClick={onBackToOverview}
              style={{ background: "none", border: 0, padding: 0 }}
            >
              {course.name}
            </button>
            <svg className="ic" viewBox="0 0 24 24" aria-hidden="true">
              <path d="m9 18 6-6-6-6" />
            </svg>
            <span aria-current="page">
              Module {activeModule.n}: {activeModule.title}
            </span>
          </>
        ) : viewMode === "topic" && activeTopic ? (
          <>
            <button
              type="button"
              className="link"
              onClick={onBackToOverview}
              style={{ background: "none", border: 0, padding: 0 }}
            >
              {course.name}
            </button>
            <svg className="ic" viewBox="0 0 24 24" aria-hidden="true">
              <path d="m9 18 6-6-6-6" />
            </svg>
            <span aria-current="page">{activeTopic.title}</span>
          </>
        ) : (
          <span aria-current="page">{course.name}</span>
        )}
      </nav>

      {/* Header / Hero */}
      <section className="head">
        {viewMode === "module" && activeModule ? (
          <>
            <div className="head-main">
              <div className="overline">
                Module {activeModule.n} · Syllabus Module
              </div>
              <h1 className="topic">{activeModule.title}</h1>
              <div className="meta">
                <span className="tag code">{course.code}</span>
                <span className="tag">
                  {activeModuleQuestionCount} questions
                  {isLive ? "" : " · placeholder"}
                </span>
                <span className="tag">
                  {activeModule.topics.length} topics
                </span>
                <span className="badge Current">
                  <svg className="ic" viewBox="0 0 24 24" aria-hidden="true">
                    <path d="M20 6 9 17l-5-5" />
                  </svg>
                  Current syllabus
                </span>
              </div>
            </div>
            <button
              className="btn"
              type="button"
              onClick={onBackToOverview}
            >
              <svg className="ic" viewBox="0 0 24 24" aria-hidden="true">
                <path d="M19 12H5" />
                <path d="m12 19-7-7 7-7" />
              </svg>
              Back to all modules
            </button>
          </>
        ) : viewMode === "topic" && activeTopic ? (
          <>
            <div className="head-main">
              <div className="overline">
                Module {activeTopic.mod.n} · {activeTopic.mod.title}
              </div>
              <h1 className="topic">{activeTopic.title}</h1>
              <div className="meta">
                <span className="tag code">{course.code}</span>
                <span className="tag">
                  {questions.filter((q) => q.t === activeTopic.id).length}{" "}
                  questions{isLive ? "" : " · placeholder"}
                </span>
                <span className="badge Current">
                  <svg className="ic" viewBox="0 0 24 24" aria-hidden="true">
                    <path d="M20 6 9 17l-5-5" />
                  </svg>
                  Current syllabus
                </span>
              </div>
            </div>
            <button
              className="btn"
              type="button"
              onClick={onBackToOverview}
            >
              <svg className="ic" viewBox="0 0 24 24" aria-hidden="true">
                <path d="M19 12H5" />
                <path d="m12 19-7-7 7-7" />
              </svg>
              Back to topics
            </button>
          </>
        ) : (
          <>
            <div className="head-main">
              <span className="tag code" style={{ alignSelf: "flex-start" }}>
                {course.code}
              </span>
              <h1>{course.name}</h1>
              <div className="meta">
                <span className="m">
                  <svg className="ic s" viewBox="0 0 24 24" aria-hidden="true">
                    <path d="M20 10c0 6-8 12-8 12S4 16 4 10a8 8 0 0 1 16 0" />
                    <circle cx="12" cy="10" r="3" />
                  </svg>
                  {course.campus}
                </span>
                <span className="m">
                  <svg className="ic s" viewBox="0 0 24 24" aria-hidden="true">
                    <path d="M2 3h6a4 4 0 0 1 4 4v14a3 3 0 0 0-3-3H2z" />
                    <path d="M22 3h-6a4 4 0 0 0-4 4v14a3 3 0 0 1 3-3h7z" />
                  </svg>
                  {course.curriculum}
                </span>
                <span className="badge Current">
                  <svg className="ic" viewBox="0 0 24 24" aria-hidden="true">
                    <path d="M20 6 9 17l-5-5" />
                  </svg>
                  Current syllabus
                </span>
              </div>
            </div>
            <div className="stats" aria-label="Course statistics">
              <div className="stat">
                <b>{questions.length}</b>
                <small>QUESTIONS</small>
              </div>
              <i className="dot"></i>
              <div className="stat">
                <b>{modules.length}</b>
                <small>MODULES</small>
              </div>
              <i className="dot"></i>
              <div className="stat">
                <b>{totalTopics}</b>
                <small>TOPICS</small>
              </div>
            </div>
          </>
        )}
      </section>
    </>
  );
}

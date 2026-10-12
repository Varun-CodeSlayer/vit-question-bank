import React from "react";
import Link from "next/link";

export interface Course {
  code: string;
  name: string;
  count: number;
}

export interface QuestionCardProps {
  course: Course;
  decorative?: boolean;
  onClick?: () => void;
  href?: string;
}

export default function QuestionCard({
  course,
  decorative = false,
  onClick,
  href,
}: QuestionCardProps) {
  const content = (
    <span className="card__body">
      <span className="card__emphasis" aria-hidden="true"></span>
      <span className="card__glow" aria-hidden="true"></span>
      <span className="card__code">{course.code}</span>
      <span className="card__name">{course.name}</span>
      <span className="card__total">
        <span className="card__count">{course.count}</span>
        <span className="card__unit">QUESTIONS</span>
      </span>
    </span>
  );

  if (decorative) {
    return (
      <div className="card" tabIndex={-1} aria-hidden={true}>
        {content}
      </div>
    );
  }

  if (onClick) {
    return (
      <button type="button" className="card" onClick={onClick}>
        {content}
      </button>
    );
  }

  return (
    <Link href={href || `/practice/${course.code}`} className="card">
      {content}
    </Link>
  );
}

export { QuestionCard };


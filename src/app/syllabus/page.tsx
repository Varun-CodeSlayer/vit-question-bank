import React, { Suspense } from "react";
import SyllabusListingContent from "@/components/syllabus/SyllabusListingContent";

export const metadata = {
  title: "Course Syllabus | VIT Question Bank",
  description:
    "Explore official course curriculum, syllabus documents, and module outlines for VIT Chennai courses.",
};

function SyllabusListingFallback() {
  return (
    <div
      style={{
        minHeight: "100vh",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
      }}
    >
      <p style={{ color: "var(--text2)", fontSize: "16px" }}>Loading course syllabi...</p>
    </div>
  );
}

export default function SyllabusPage() {
  return (
    <Suspense fallback={<SyllabusListingFallback />}>
      <SyllabusListingContent />
    </Suspense>
  );
}

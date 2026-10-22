import React, { Suspense } from "react";
import PapersListingContent from "@/components/papers/PapersListingContent";

export const metadata = {
  title: "Past Exam Papers | VIT Question Bank",
  description:
    "Browse, view, and download previous-year CAT 1, CAT 2, and FAT question papers organized by course, semester, and year.",
};

function PapersListingFallback() {
  return (
    <div style={{ minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center" }}>
      <p style={{ color: "var(--text2)", fontSize: "16px" }}>Loading question papers...</p>
    </div>
  );
}

export default function PapersPage() {
  return (
    <Suspense fallback={<PapersListingFallback />}>
      <PapersListingContent />
    </Suspense>
  );
}

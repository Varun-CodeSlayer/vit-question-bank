import React, { Suspense } from "react";
import { Metadata } from "next";
import PaperViewContent from "@/components/papers/PaperViewContent";
import { supabase } from "@/lib/supabase";
import { fetchPaperById } from "@/lib/paper-service";

type PageProps = {
  params: Promise<{ paperId: string }>;
};

export async function generateStaticParams() {
  try {
    const { data } = await supabase.from("papers").select("paper_id");
    if (!data) return [];
    return data.map((p) => ({
      paperId: p.paper_id,
    }));
  } catch (err) {
    console.warn("Could not fetch paper IDs for static params:", err);
    return [];
  }
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const resolved = await params;
  try {
    const paper = await fetchPaperById(resolved.paperId);
    if (!paper) {
      return {
        title: "Question Paper | VIT Question Bank",
        description: "View and download past exam papers.",
      };
    }

    return {
      title: `${paper.courseCode} ${paper.examType} (${paper.semester} ${paper.academicYear}) | VIT Question Bank`,
      description: `View and download ${paper.courseName} (${paper.courseCode}) ${paper.examType} exam paper.`,
    };
  } catch {
    return {
      title: "Question Paper | VIT Question Bank",
      description: "View and download past exam papers.",
    };
  }
}

export default async function PaperDetailPage({ params }: PageProps) {
  const resolved = await params;

  return (
    <Suspense
      fallback={
        <div style={{ minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center" }}>
          <p style={{ color: "var(--text2)", fontSize: "16px" }}>Loading question paper...</p>
        </div>
      }
    >
      <PaperViewContent paperId={resolved.paperId} />
    </Suspense>
  );
}


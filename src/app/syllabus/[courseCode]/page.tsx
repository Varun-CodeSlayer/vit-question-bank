import React, { Suspense } from "react";
import { Metadata } from "next";
import SyllabusViewContent from "@/components/syllabus/SyllabusViewContent";
import { supabase } from "@/lib/supabase";
import { fetchSyllabusByCourseCode } from "@/lib/syllabus-service";

type PageProps = {
  params: Promise<{ courseCode: string }>;
};

export async function generateStaticParams() {
  const codes = new Set<string>(["BACSE201", "BACSE103", "BCSE384L"]);
  try {
    const { data } = await supabase.from("courses").select("course_code");
    data?.forEach((c) => {
      if (c.course_code) codes.add(c.course_code.trim());
    });
  } catch (err) {
    console.warn("Could not fetch course codes for static params:", err);
  }
  return Array.from(codes).map((courseCode) => ({ courseCode }));
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const resolved = await params;
  try {
    const syllabus = await fetchSyllabusByCourseCode(resolved.courseCode);
    if (!syllabus) {
      return {
        title: "Course Syllabus | VIT Question Bank",
        description: "View and download official course syllabus.",
      };
    }

    return {
      title: `${syllabus.courseCode} Syllabus - ${syllabus.courseName} | VIT Question Bank`,
      description: `View and download official syllabus PDF for ${syllabus.courseName} (${syllabus.courseCode}).`,
    };
  } catch {
    return {
      title: "Course Syllabus | VIT Question Bank",
      description: "View and download official course syllabus.",
    };
  }
}

export default async function SyllabusDetailPage({ params }: PageProps) {
  const resolved = await params;

  return (
    <Suspense
      fallback={
        <div
          style={{
            minHeight: "100vh",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          <p style={{ color: "var(--text2)", fontSize: "16px" }}>Loading syllabus...</p>
        </div>
      }
    >
      <SyllabusViewContent courseCode={resolved.courseCode} />
    </Suspense>
  );
}


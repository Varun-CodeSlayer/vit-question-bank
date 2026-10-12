import React from "react";
import CoursePracticeContent from "@/components/questions/CoursePracticeContent";
import { supabase } from "@/lib/supabase";

type PageProps = {
  params: Promise<{ courseCode: string }>;
};

export async function generateStaticParams() {
  const codes = new Set<string>(["BACSE201", "BCSE384L"]);
  try {
    const { data } = await supabase.from("courses").select("course_code");
    data?.forEach((c) => {
      if (c.course_code) codes.add(c.course_code);
    });
  } catch (err) {
    console.warn("Could not fetch course codes for static params:", err);
  }
  return Array.from(codes).map((courseCode) => ({ courseCode }));
}

export default async function CoursePracticePage({ params }: PageProps) {
  const resolved = await params;
  return <CoursePracticeContent initialCourseCode={resolved?.courseCode} />;
}

import { supabase } from "@/lib/supabase";
import {
  CourseInfo,
  Module,
  Question,
  TopicMapEntry,
} from "@/lib/question-data";

export interface PracticeCourse {
  code: string;
  name: string;
  count: number;
  courseId: string;
}

export interface PlatformStats {
  coursesCount: number;
  papersCount: number;
  questionsCount: number;
}

export interface CoursePracticeData {
  course: CourseInfo;
  modules: Module[];
  questions: Question[];
  topicsMap: Record<string, TopicMapEntry>;
  topicIndexMap: Record<string, string>;
}

interface DbCourseWithCount {
  course_id: string;
  course_name: string;
  course_code: string;
  questions?: Array<{ count?: number | null }> | null;
}

interface DbTopicRow {
  topic_id: string;
  module_id: string;
  topic_order?: number | null;
  topic_title: string;
}

interface DbModuleRow {
  module_id: string;
  course_id: string;
  module_number?: number | null;
  module_title: string;
  topics?: DbTopicRow[] | null;
}

interface DbPaperRow {
  paper_id: string;
  original_filename?: string | null;
  exam_type?: string | null;
  academic_term?: string | null;
  slot?: string | null;
  file_url?: string | null;
}

interface DbQuestionRow {
  question_id: string;
  paper_id?: string | null;
  course_id: string;
  original_question_number?: string | null;
  marks?: number | null;
  question_type?: string | null;
  cognitive_level?: string | null;
  bt_level_printed?: number | null;
  module_id?: string | null;
  primary_topic_id?: string | null;
  primary_topic_title?: string | null;
  has_image_reference?: boolean | null;
  question_text?: string | null;
  papers?: DbPaperRow | null;
}

export function formatQuestionType(rawType?: string | null): string {
  if (!rawType) return "General";
  return rawType
    .split("_")
    .map((w) => w.charAt(0).toUpperCase() + w.slice(1).toLowerCase())
    .join(" ");
}

export function parseAcademicTerm(term?: string | null): { sem: string; ay: string } {
  if (!term) return { sem: "Fall", ay: "2026–27" };
  const parts = term.trim().split(/\s+/);
  if (parts.length >= 2) {
    return { sem: parts[0], ay: parts.slice(1).join(" ") };
  }
  return { sem: term, ay: "" };
}

/**
 * Fetch list of courses with question counts from Supabase
 */
export async function fetchCoursesWithCounts(): Promise<PracticeCourse[]> {
  const { data, error } = await supabase
    .from("courses")
    .select("course_id, course_name, course_code, questions(count)")
    .order("course_code", { ascending: true });

  if (error) {
    console.error("Error fetching courses from Supabase:", error);
    throw error;
  }

  if (!data) return [];

  const rows = data as unknown as DbCourseWithCount[];
  return rows.map((row) => {
    const questionCount =
      Array.isArray(row.questions) && row.questions[0]?.count != null
        ? Number(row.questions[0].count)
        : 0;

    return {
      code: row.course_code,
      name: row.course_name,
      count: questionCount,
      courseId: row.course_id,
    };
  });
}

/**
 * Fetch overall platform counts for courses, papers, and questions
 */
export async function fetchPlatformStats(): Promise<PlatformStats> {
  try {
    const [coursesRes, papersRes, questionsRes] = await Promise.all([
      supabase.from("courses").select("*", { count: "exact", head: true }),
      supabase.from("papers").select("*", { count: "exact", head: true }),
      supabase.from("questions").select("*", { count: "exact", head: true }),
    ]);

    return {
      coursesCount: coursesRes.count ?? 0,
      papersCount: papersRes.count ?? 0,
      questionsCount: questionsRes.count ?? 0,
    };
  } catch (err) {
    console.error("Error fetching platform stats:", err);
    return {
      coursesCount: 0,
      papersCount: 0,
      questionsCount: 0,
    };
  }
}

/**
 * Fetch all data for a specific course: course info, modules with topics, questions with papers
 */
export async function fetchCoursePracticeData(
  courseCode: string
): Promise<CoursePracticeData | null> {
  const cleanCode = (courseCode || "").trim().toUpperCase();

  // 1. Fetch course details
  const { data: dbCourse, error: courseErr } = await supabase
    .from("courses")
    .select("*")
    .ilike("course_code", cleanCode)
    .maybeSingle();

  if (courseErr) {
    console.error(`Error fetching course [${cleanCode}]:`, courseErr);
    throw courseErr;
  }

  if (!dbCourse) {
    return null;
  }

  // 2. Fetch modules with topics and questions with papers in parallel
  const [modulesRes, questionsRes] = await Promise.all([
    supabase
      .from("modules")
      .select("*, topics(*)")
      .eq("course_id", dbCourse.course_id)
      .order("module_number", { ascending: true }),
    supabase
      .from("questions")
      .select("*, papers(*)")
      .eq("course_id", dbCourse.course_id)
      .order("created_at", { ascending: true }),
  ]);

  if (modulesRes.error) {
    console.error("Error fetching modules:", modulesRes.error);
    throw modulesRes.error;
  }
  if (questionsRes.error) {
    console.error("Error fetching questions:", questionsRes.error);
    throw questionsRes.error;
  }

  // Map Course Info
  const course: CourseInfo = {
    code: dbCourse.course_code,
    name: dbCourse.course_name,
    campus: dbCourse.course_id?.startsWith("VITC") ? "VIT Chennai" : "VIT",
    curriculum: "Curriculum 2022",
  };

  const topicIndexMap: Record<string, string> = {};

  // Map Modules
  const moduleRows = (modulesRes.data || []) as unknown as DbModuleRow[];
  const modules: Module[] = moduleRows.map((m) => {
    const modNum = m.module_number || 1;
    const sortedTopics = (m.topics || []).sort(
      (a, b) => (a.topic_order || 0) - (b.topic_order || 0)
    );

    sortedTopics.forEach((t, idx) => {
      const order = t.topic_order != null ? t.topic_order : idx + 1;
      topicIndexMap[t.topic_id] = `${modNum}.${order}`;
    });

    return {
      n: String(modNum).padStart(2, "0"),
      title: m.module_title,
      topics: sortedTopics.map((t) => [t.topic_id, t.topic_title]),
      id: m.module_id,
    };
  });

  // Map Topics Map
  const topicsMap: Record<string, TopicMapEntry> = {};
  modules.forEach((m) => {
    m.topics.forEach(([tid, title]) => {
      topicsMap[tid] = { id: tid, title, mod: m };
      // Also register by display index so hashes like #topic=1.1 or #topic=BACSE201-M1-T1 both work
      const displayIndex = topicIndexMap[tid];
      if (displayIndex && !topicsMap[displayIndex]) {
        topicsMap[displayIndex] = { id: tid, title, mod: m };
      }
    });
  });

  // Map Questions
  const questionRows = (questionsRes.data || []) as unknown as DbQuestionRow[];
  const questions: Question[] = questionRows.map((q) => {
    const { sem, ay } = parseAcademicTerm(q.papers?.academic_term);
    return {
      id: q.question_id,
      t: q.primary_topic_id || "",
      n: q.original_question_number || "Q",
      exam: q.papers?.exam_type || "CAT-1",
      marks: String(q.marks ?? 0),
      sem,
      ay,
      slot: q.papers?.slot || "A1",
      campus: course.campus,
      qt: formatQuestionType(q.question_type),
      cur: "Current",
      text: q.question_text || "",
      img: !!q.has_image_reference,
      paperId: q.paper_id ?? undefined,
      paperName: q.papers?.original_filename || q.paper_id || undefined,
      paperUrl: q.papers?.file_url || null,
      cognitiveLevel: q.cognitive_level || null,
      btLevel: q.bt_level_printed || null,
      moduleId: q.module_id ?? undefined,
      topicTitle: q.primary_topic_title || "",
    };
  });

  return { course, modules, questions, topicsMap, topicIndexMap };
}

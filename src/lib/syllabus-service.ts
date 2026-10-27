import { supabase } from "@/lib/supabase";
import {
  extractGoogleDriveFileId,
  getGoogleDriveEmbedUrl,
  getGoogleDriveViewUrl,
  getGoogleDriveDownloadUrl,
} from "@/lib/paper-service";

export interface SyllabusItem {
  courseId: string;
  courseName: string;
  courseCode: string;
  syllabusUrl: string | null;
  driveFileId: string | null;
  embedUrl: string | null;
  viewUrl: string | null;
  downloadUrl: string | null;
  hasSyllabus: boolean;
}

export interface DbCourseRow {
  course_id: string;
  course_name: string;
  course_code: string;
  syllabus_url?: string | null;
}

/**
 * Maps a raw course row from Supabase to a structured SyllabusItem
 */
export function mapDbCourseToSyllabus(row: DbCourseRow): SyllabusItem {
  const rawUrl = row.syllabus_url?.trim() || null;
  const driveFileId = extractGoogleDriveFileId(rawUrl);
  const embedUrl = getGoogleDriveEmbedUrl(rawUrl);
  const viewUrl = getGoogleDriveViewUrl(rawUrl);
  const downloadUrl = getGoogleDriveDownloadUrl(rawUrl);
  const hasSyllabus = Boolean(rawUrl && (driveFileId || rawUrl.startsWith("http")));

  return {
    courseId: row.course_id,
    courseName: row.course_name,
    courseCode: row.course_code,
    syllabusUrl: rawUrl,
    driveFileId,
    embedUrl,
    viewUrl,
    downloadUrl,
    hasSyllabus,
  };
}

/**
 * Fetch all courses with syllabus information from Supabase, ordered alphabetically by course code.
 */
export async function fetchAllSyllabi(): Promise<SyllabusItem[]> {
  const { data, error } = await supabase
    .from("courses")
    .select("course_id, course_name, course_code, syllabus_url")
    .order("course_code", { ascending: true });

  if (error) {
    console.error("Error fetching courses for syllabus:", error);
    throw error;
  }

  if (!data) return [];
  return (data as DbCourseRow[]).map(mapDbCourseToSyllabus);
}

/**
 * Fetch a single course's syllabus information by courseCode (or fallback to courseId).
 */
export async function fetchSyllabusByCourseCode(
  courseCodeOrId: string
): Promise<SyllabusItem | null> {
  const cleanParam = (courseCodeOrId || "").trim();
  if (!cleanParam) return null;

  // 1. Try matching course_code case-insensitively
  const { data: byCode, error: codeErr } = await supabase
    .from("courses")
    .select("course_id, course_name, course_code, syllabus_url")
    .ilike("course_code", cleanParam)
    .maybeSingle();

  if (codeErr) {
    console.error(`Error fetching syllabus for course_code [${cleanParam}]:`, codeErr);
  }

  if (byCode) {
    return mapDbCourseToSyllabus(byCode as DbCourseRow);
  }

  // 2. Fallback: try matching course_id
  const { data: byId, error: idErr } = await supabase
    .from("courses")
    .select("course_id, course_name, course_code, syllabus_url")
    .eq("course_id", cleanParam)
    .maybeSingle();

  if (idErr) {
    console.error(`Error fetching syllabus for course_id [${cleanParam}]:`, idErr);
  }

  if (byId) {
    return mapDbCourseToSyllabus(byId as DbCourseRow);
  }

  return null;
}


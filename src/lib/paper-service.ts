import { supabase } from "@/lib/supabase";

export interface PaperItem {
  paperId: string;
  originalFilename?: string | null;
  courseId: string;
  courseName: string;
  courseCode: string;
  academicTerm?: string | null;
  semester: string;
  academicYear: string;
  examType: string;
  slot?: string | null;
  maxMarks?: number | null;
  fileUrl?: string | null;
  driveFileId?: string | null;
  effectiveDriveId?: string | null;
  driveViewUrl?: string | null;
  embedUrl?: string | null;
  downloadUrl?: string | null;
}

export function parseAcademicTerm(term?: string | null): { sem: string; ay: string } {
  if (!term) return { sem: "Unknown", ay: "Unknown" };
  const parts = term.trim().split(/\s+/);
  if (parts.length >= 2) {
    return { sem: parts[0], ay: parts.slice(1).join(" ") };
  }
  return { sem: term, ay: "" };
}

/**
 * Extract Google Drive file ID from URL or raw file ID string
 */
export function extractGoogleDriveFileId(input?: string | null): string | null {
  if (!input) return null;
  const trimmed = input.trim();
  if (!trimmed) return null;

  // Pattern 1: /file/d/FILE_ID
  const matchFileD = trimmed.match(/\/file\/d\/([a-zA-Z0-9_-]+)/);
  if (matchFileD && matchFileD[1]) return matchFileD[1];

  // Pattern 2: /d/FILE_ID
  const matchD = trimmed.match(/\/d\/([a-zA-Z0-9_-]+)/);
  if (matchD && matchD[1]) return matchD[1];

  // Pattern 3: id=FILE_ID query parameter
  const matchIdParam = trimmed.match(/[?&]id=([a-zA-Z0-9_-]+)/);
  if (matchIdParam && matchIdParam[1]) return matchIdParam[1];

  // Pattern 4: open?id=FILE_ID
  const matchOpenId = trimmed.match(/\/open\?id=([a-zA-Z0-9_-]+)/);
  if (matchOpenId && matchOpenId[1]) return matchOpenId[1];

  // Pattern 5: Raw alphanumeric Google Drive ID (typically 20-55 chars)
  if (/^[a-zA-Z0-9_-]{20,55}$/.test(trimmed) && !trimmed.includes("/") && !trimmed.includes(".")) {
    return trimmed;
  }

  return null;
}

/**
 * Build Google Drive embed preview URL
 */
export function getGoogleDriveEmbedUrl(fileIdOrUrl?: string | null): string | null {
  const fileId = extractGoogleDriveFileId(fileIdOrUrl);
  if (!fileId) return null;
  return `https://drive.google.com/file/d/${fileId}/preview`;
}

/**
 * Build Google Drive direct view URL
 */
export function getGoogleDriveViewUrl(fileIdOrUrl?: string | null): string | null {
  const fileId = extractGoogleDriveFileId(fileIdOrUrl);
  if (fileId) {
    return `https://drive.google.com/file/d/${fileId}/view`;
  }
  if (fileIdOrUrl && (fileIdOrUrl.trim().startsWith("http://") || fileIdOrUrl.trim().startsWith("https://"))) {
    return fileIdOrUrl.trim();
  }
  return null;
}

/**
 * Build Google Drive direct download URL or return external link
 */
export function getGoogleDriveDownloadUrl(fileIdOrUrl?: string | null): string | null {
  const fileId = extractGoogleDriveFileId(fileIdOrUrl);
  if (fileId) {
    return `https://drive.google.com/uc?export=download&id=${fileId}`;
  }
  if (fileIdOrUrl && (fileIdOrUrl.trim().startsWith("http://") || fileIdOrUrl.trim().startsWith("https://"))) {
    return fileIdOrUrl.trim();
  }
  return null;
}

/**
 * Fetch all papers from database
 */
export async function fetchPapers(): Promise<PaperItem[]> {
  const { data, error } = await supabase
    .from("papers")
    .select("*")
    .order("course_code", { ascending: true })
    .order("exam_type", { ascending: true });

  if (error) {
    console.error("Error fetching papers from Supabase:", error);
    throw error;
  }

  if (!data) return [];

  return data.map((row) => {
    const { sem, ay } = parseAcademicTerm(row.academic_term);
    const driveSource = row.drive_file_id || row.file_url;
    const effectiveDriveId = extractGoogleDriveFileId(driveSource);
    const embedUrl = effectiveDriveId ? `https://drive.google.com/file/d/${effectiveDriveId}/preview` : null;
    const driveViewUrl = getGoogleDriveViewUrl(driveSource);
    const downloadUrl = getGoogleDriveDownloadUrl(driveSource);

    return {
      paperId: row.paper_id,
      originalFilename: row.original_filename,
      courseId: row.course_id,
      courseName: row.course_name || row.course_code,
      courseCode: row.course_code,
      academicTerm: row.academic_term,
      semester: sem,
      academicYear: ay,
      examType: row.exam_type || "Unknown",
      slot: row.slot,
      maxMarks: row.max_marks,
      fileUrl: row.file_url,
      driveFileId: row.drive_file_id,
      effectiveDriveId,
      driveViewUrl,
      embedUrl,
      downloadUrl,
    };
  });
}

/**
 * Fetch a single paper by its paper_id
 */
export async function fetchPaperById(paperId: string): Promise<PaperItem | null> {
  const cleanId = (paperId || "").trim();
  if (!cleanId) return null;

  const { data, error } = await supabase
    .from("papers")
    .select("*")
    .eq("paper_id", cleanId)
    .maybeSingle();

  if (error) {
    console.error(`Error fetching paper [${cleanId}]:`, error);
    throw error;
  }

  if (!data) return null;

  const { sem, ay } = parseAcademicTerm(data.academic_term);
  const driveSource = data.drive_file_id || data.file_url;
  const effectiveDriveId = extractGoogleDriveFileId(driveSource);
  const embedUrl = effectiveDriveId ? `https://drive.google.com/file/d/${effectiveDriveId}/preview` : null;
  const driveViewUrl = getGoogleDriveViewUrl(driveSource);
  const downloadUrl = getGoogleDriveDownloadUrl(driveSource);

  return {
    paperId: data.paper_id,
    originalFilename: data.original_filename,
    courseId: data.course_id,
    courseName: data.course_name || data.course_code,
    courseCode: data.course_code,
    academicTerm: data.academic_term,
    semester: sem,
    academicYear: ay,
    examType: data.exam_type || "Unknown",
    slot: data.slot,
    maxMarks: data.max_marks,
    fileUrl: data.file_url,
    driveFileId: data.drive_file_id,
    effectiveDriveId,
    driveViewUrl,
    embedUrl,
    downloadUrl,
  };
}

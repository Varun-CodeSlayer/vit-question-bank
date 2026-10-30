export interface Topic {
  id: string;
  title: string;
}

export interface Module {
  n: string;
  title: string;
  topics: [string, string][];
  /** Internal DB module id (optional, set when data comes from Supabase) */
  id?: string;
}

export interface QuestionPart {
  part?: string;
  subpart?: string;
  label?: string;
  id?: string;
  text?: string;
  question?: string;
  description?: string;
  prompt?: string;
  marks?: number | string | null;
  mark?: number | string | null;
  max_marks?: number | string | null;
  [key: string]: unknown;
}

export interface NormalizedPart {
  part: string;
  text: string;
  marks: string;
}

export function normalizePart(
  item: unknown,
  index: number
): NormalizedPart {
  if (typeof item === "string") {
    let str = item.trim();
    let part = "";
    let marks = "";

    const marksMatch = str.match(
      /[\[\(]\s*(\d+(?:\.\d+)?)\s*(?:marks?|m)?\s*[\]\)]\s*$/i
    );
    if (marksMatch) {
      marks = marksMatch[1];
      str = str.substring(0, marksMatch.index).trim();
    }

    const partMatch =
      str.match(/^\(?([a-zA-Z0-9]+)\)\s*/i) ||
      str.match(/^([a-zA-Z0-9]+)[.:\-]\s*/i);
    if (partMatch) {
      part = partMatch[1];
      str = str.substring(partMatch[0].length).trim();
    } else {
      part = String(index + 1);
    }

    return { part, text: str, marks };
  }

  if (typeof item === "object" && item !== null) {
    const obj = item as Record<string, unknown>;
    const rawPart =
      obj.part ?? obj.subpart ?? obj.label ?? obj.id ?? String(index + 1);
    const rawText =
      obj.text ?? obj.question ?? obj.description ?? obj.prompt ?? "";
    const rawMarks = obj.marks ?? obj.mark ?? obj.max_marks ?? "";

    let textStr = String(rawText);
    let marksStr =
      rawMarks != null && rawMarks !== "" ? String(rawMarks).trim() : "";

    if (!marksStr && textStr) {
      const marksMatch = textStr.match(
        /[\[\(]\s*(\d+(?:\.\d+)?)\s*(?:marks?|m)?\s*[\]\)]\s*$/i
      );
      if (marksMatch) {
        marksStr = marksMatch[1];
        textStr = textStr.substring(0, marksMatch.index).trim();
      }
    }

    marksStr = marksStr.replace(/^[\[\(]\s*|\s*[\]\)]$/g, "").trim();

    return {
      part:
        String(rawPart)
          .replace(/^[\[\(]\s*|\s*[\]\):.]*$/g, "")
          .trim() || String(index + 1),
      text: textStr,
      marks: marksStr,
    };
  }

  return {
    part: String(index + 1),
    text: item != null ? String(item) : "",
    marks: "",
  };
}

export interface GeneralTableData {
  headers: string[];
  rows: string[][];
  alignments: ("left" | "center" | "right")[];
  isSubquestionShape?: boolean;
}

export function formatHeaderTitle(key: string): string {
  const l = key.toLowerCase();
  if (l === "part" || l === "subpart") return "Part";
  if (l === "text" || l === "question" || l === "prompt" || l === "description") return "Sub-question";
  if (l === "marks" || l === "mark" || l === "max_marks") return "Marks";
  return key;
}

export function formatCellValue(val: unknown): string {
  if (val === null || val === undefined || val === "") return "—";
  if (Array.isArray(val)) {
    return val.join(", ");
  }
  if (typeof val === "object") {
    try {
      return JSON.stringify(val);
    } catch {
      return "[Object]";
    }
  }
  return String(val);
}

export function inferRowHeader(keys: string[]): string {
  if (keys.length === 0) return "State";
  const allStates = keys.every(
    (k) => /^[A-Z]$/i.test(k) || /^q\d+$/i.test(k) || /^s\d+$/i.test(k)
  );
  if (allStates) return "State";
  const allProcesses = keys.every((k) => /^p\d+$/i.test(k));
  if (allProcesses) return "Process";
  const allNumbers = keys.every((k) => /^\d+$/.test(k));
  if (allNumbers) return "#";
  return "State";
}

export function computeAlignments(
  headers: string[],
  rows: string[][]
): ("left" | "center" | "right")[] {
  return headers.map((h, cIdx) => {
    const l = h.toLowerCase();
    if (l === "marks" || l === "mark") return "right";
    if (l === "part" || l === "subpart") return "center";
    if (cIdx === 0 && rows.every((r) => (r[0] ?? "").length <= 6)) return "center";
    if (h.length <= 4 && rows.every((r) => String(r[cIdx] ?? "").length <= 6)) return "center";
    return "left";
  });
}

export function extractNestedTransitionTable(
  data: unknown
): Record<string, Record<string, unknown>> | null {
  let map: unknown = data;
  if (Array.isArray(data)) {
    if (data.length === 1 && typeof data[0] === "object" && data[0] !== null) {
      map = data[0];
    } else if (
      data.length > 1 &&
      data.every((item) => typeof item === "object" && item !== null)
    ) {
      const allSingleNested = data.every((item) => {
        const keys = Object.keys(item);
        return (
          keys.length === 1 &&
          typeof item[keys[0]] === "object" &&
          item[keys[0]] !== null &&
          !Array.isArray(item[keys[0]])
        );
      });
      if (allSingleNested) {
        const m: Record<string, Record<string, unknown>> = {};
        data.forEach((item) => {
          const k = Object.keys(item)[0];
          m[k] = item[k] as Record<string, unknown>;
        });
        map = m;
      }
    }
  }

  if (!map || typeof map !== "object" || Array.isArray(map)) return null;

  const obj = map as Record<string, unknown>;
  const rowKeys = Object.keys(obj);
  if (rowKeys.length === 0) return null;

  const allValuesAreObjects = rowKeys.every(
    (k) =>
      obj[k] !== null &&
      typeof obj[k] === "object" &&
      !Array.isArray(obj[k])
  );

  if (!allValuesAreObjects) return null;

  return obj as Record<string, Record<string, unknown>>;
}

function parseMarkdownTable(text: string): GeneralTableData | null {
  const lines = text
    .split("\n")
    .map((l) => l.trim())
    .filter(Boolean);
  const tableLines = lines.filter((l) => l.includes("|"));
  if (tableLines.length < 2) return null;
  const parseRow = (l: string) => {
    let clean = l;
    if (clean.startsWith("|")) clean = clean.slice(1);
    if (clean.endsWith("|")) clean = clean.slice(0, -1);
    return clean.split("|").map((c) => c.trim());
  };
  const headers = parseRow(tableLines[0]);
  const rows: string[][] = [];
  for (let i = 1; i < tableLines.length; i++) {
    if (/^\|?[\s\-:]+(\|[\s\-:]+)+\|?$/.test(tableLines[i])) continue;
    rows.push(parseRow(tableLines[i]));
  }
  if (rows.length === 0) return null;
  const alignments = computeAlignments(headers, rows);
  return { headers, rows, alignments };
}

export function parseGeneralTableData(data: unknown): GeneralTableData | null {
  if (!data) return null;

  let parsed = data;
  if (typeof parsed === "string") {
    const trimmed = parsed.trim();
    if (!trimmed || trimmed === "[]" || trimmed === "{}") return null;
    try {
      parsed = JSON.parse(trimmed);
    } catch {
      if (trimmed.includes("|")) {
        return parseMarkdownTable(trimmed);
      }
      return null;
    }
  }

  // 1. Check if this is a nested transition table (direct object or array-wrapped)
  const nestedMap = extractNestedTransitionTable(parsed);
  if (nestedMap) {
    const rowKeys = Object.keys(nestedMap);
    const colKeySet = new Set<string>();
    rowKeys.forEach((rk) => {
      const inner = nestedMap[rk];
      if (inner && typeof inner === "object") {
        Object.keys(inner).forEach((ck) => colKeySet.add(ck));
      }
    });
    const colKeys = Array.from(colKeySet);
    const firstHeader = inferRowHeader(rowKeys);
    const headers = [firstHeader, ...colKeys];
    const rows = rowKeys.map((rk) => {
      const rowObj = nestedMap[rk] || {};
      const cells = [rk];
      colKeys.forEach((ck) => {
        cells.push(formatCellValue(rowObj[ck]));
      });
      return cells;
    });
    const alignments = computeAlignments(headers, rows);
    return { headers, rows, alignments };
  }

  if (!parsed || typeof parsed !== "object") return null;

  // 2. Array
  if (Array.isArray(parsed)) {
    if (parsed.length === 0) return null;

    // 2a. Array of Arrays
    if (Array.isArray(parsed[0])) {
      const headers = (parsed[0] as unknown[]).map((h) => String(h ?? ""));
      const rows = (parsed.slice(1) as unknown[][]).map((row) =>
        Array.isArray(row)
          ? row.map((c) => formatCellValue(c))
          : [formatCellValue(row)]
      );
      if (headers.length === 0 || rows.length === 0) return null;
      const alignments = computeAlignments(headers, rows);
      return { headers, rows, alignments };
    }

    // 2b. Array of Objects
    if (typeof parsed[0] === "object" && parsed[0] !== null) {
      const keySet = new Set<string>();
      (parsed as Record<string, unknown>[]).forEach((item) => {
        if (item && typeof item === "object") {
          Object.keys(item).forEach((k) => keySet.add(k));
        }
      });
      const keys = Array.from(keySet);
      if (keys.length === 0) return null;

      const headers = keys.map((k) => formatHeaderTitle(k));
      const rows = (parsed as Record<string, unknown>[]).map((item) => {
        return keys.map((k) => {
          const val = item ? item[k] : undefined;
          return formatCellValue(val);
        });
      });
      const alignments = computeAlignments(headers, rows);
      return { headers, rows, alignments };
    }

    // 2c. Array of Strings
    const stringRows = (parsed as unknown[]).map(String);
    const hasSubparts = stringRows.some((s) =>
      /^\s*\(?[a-zA-Z0-9]+\)?[.:\-\)]/.test(s)
    );
    if (hasSubparts) {
      const headers = ["Part", "Sub-question", "Marks"];
      const rows = (parsed as unknown[]).map((item, idx) => {
        const norm = normalizePart(item, idx);
        return [
          norm.part,
          norm.text,
          norm.marks ? `${norm.marks} Marks` : "—",
        ];
      });
      const alignments = computeAlignments(headers, rows);
      return { headers, rows, alignments };
    } else {
      const headers = ["#", "Content"];
      const rows = (parsed as unknown[]).map((item, idx) => [
        String(idx + 1),
        formatCellValue(item),
      ]);
      const alignments = computeAlignments(headers, rows);
      return { headers, rows, alignments };
    }
  }

  // 3. Flat Object
  if (typeof parsed === "object" && parsed !== null) {
    const obj = parsed as Record<string, unknown>;
    const rowKeys = Object.keys(obj);
    if (rowKeys.length === 0) return null;
    const headers = ["Property", "Value"];
    const rows = rowKeys.map((k) => [k, formatCellValue(obj[k])]);
    const alignments = computeAlignments(headers, rows);
    return { headers, rows, alignments };
  }

  return null;
}

export interface Question {
  t: string; // topic id
  n: string; // question label, e.g. 'Q1'
  exam: string; // 'CAT-1' | 'CAT-2' | 'FAT'
  marks: string;
  sem: string; // 'Fall' | 'Winter'
  ay: string; // '2023–24'
  slot: string; // 'A1+TA1'
  campus: string; // 'VIT Chennai' | 'VIT Vellore'
  qt: string; // 'Construction' | 'Proof' | 'Algorithmic Application' etc.
  cur: "Current" | "Older" | "Unmapped";
  text: string;
  img?: boolean;
  // --- Supabase-sourced extras (optional; absent in static mock data) ---
  /** DB question_id */
  id?: string;
  /** paper_id the question belongs to */
  paperId?: string;
  /** Original PDF filename for display */
  paperName?: string;
  /** Direct URL to the paper PDF (null if not uploaded) */
  paperUrl?: string | null;
  cognitiveLevel?: string | null;
  btLevel?: number | null;
  /** DB module_id */
  moduleId?: string;
  /** Denormalised topic title from the DB */
  topicTitle?: string;
  /** Sub-questions / general table data from parts JSONB column */
  parts?: unknown;
  sourcePage?: number | null;
  sourcePages?: number[];
  sourceFilename?: string | null;
  difficulty?: string | null;
  hasImageReference?: boolean | null;
  imageReference?: string | null;
}

export interface CourseInfo {
  code: string;
  name: string;
  campus: string;
  curriculum: string;
}

export interface Facet {
  k: keyof Question;
  label: string;
}

export const COURSE: CourseInfo = {
  code: "BCSE384L",
  name: "Theory of Computation",
  campus: "VIT Chennai",
  curriculum: "ACE Curriculum",
};

export const MODULES: Module[] = [
  {
    n: "01",
    title: "Finite Automata",
    topics: [
      ["1.1", "Alphabets, strings and languages"],
      ["1.2", "Deterministic finite automata"],
      ["1.3", "Nondeterministic finite automata"],
    ],
  },
  {
    n: "02",
    title: "Regular Expressions and Languages",
    topics: [
      ["2.1", "Regular expressions"],
      ["2.2", "Pumping lemma for regular languages"],
      ["2.3", "Closure properties"],
    ],
  },
  {
    n: "03",
    title: "Context-Free Grammars",
    topics: [
      ["3.1", "Derivations and parse trees"],
      ["3.2", "Ambiguity and normal forms"],
    ],
  },
  {
    n: "04",
    title: "Pushdown Automata",
    topics: [
      ["4.1", "PDA construction"],
      ["4.2", "Equivalence of PDA and CFG"],
    ],
  },
  {
    n: "05",
    title: "Turing Machines",
    topics: [
      ["5.1", "Turing machine design"],
      ["5.2", "Variants of Turing machines"],
    ],
  },
  {
    n: "06",
    title: "Decidability and Complexity",
    topics: [["6.1", "Undecidability and the halting problem"]],
  },
];

const CH = "VIT Chennai";
const VL = "VIT Vellore";

const Q = (
  t: string,
  n: string,
  e: string,
  m: number | string,
  s: string,
  y: string,
  sl: string,
  c: string,
  qt: string,
  cur: "Current" | "Older" | "Unmapped",
  text: string,
  img?: boolean
): Question => ({
  t,
  n,
  exam: e,
  marks: String(m),
  sem: s,
  ay: y,
  slot: sl,
  campus: c,
  qt,
  cur,
  text,
  img: !!img,
});

export const QUESTIONS: Question[] = [
  Q("1.1", "Q1", "CAT 1", 5, "Winter", "2023–24", "A1+TA1", CH, "Descriptive", "Current", "Let Σ = {a, b}. Define Σ* and list every string of length at most 2. Give an example of a language over Σ that is infinite but not equal to Σ*."),
  Q("1.1", "Q2", "CAT 1", 5, "Fall", "2022–23", "B1+TB1", CH, "Descriptive", "Current", "Differentiate between a string, a language and an alphabet with one example each. For w = abba, find |w|, the reverse of w and the number of prefixes of w."),
  Q("1.2", "Q1", "CAT 1", 10, "Winter", "2023–24", "A1+TA1", CH, "Design", "Current", "Design a DFA over {0, 1} that accepts all strings in which the number of 0s is divisible by 3 and the string ends with 1. Give the transition table and the state diagram."),
  Q("1.2", "Q2", "FAT", 15, "Fall", "2022–23", "B2+TB2", CH, "Design", "Current", "Construct a minimal DFA for the language of all strings over {a, b} that contain the substring abb. Use the table-filling method to show that no two states of your DFA are equivalent."),
  Q("1.2", "Q3(a)", "CAT 2", 8, "Winter", "2022–23", "C1+TC1", CH, "Design", "Current", "", true),
  Q("1.2", "Q1(b)", "CAT 1", 10, "Fall", "2019–20", "D1+TD1", CH, "Design", "Older", "Define a deterministic finite automaton formally. Draw the DFA that accepts binary strings representing multiples of 5 and trace the string 10110 through it."),
  Q("1.2", "Q4", "FAT", 10, "Winter", "2021–22", "E1+TE1", VL, "Design", "Current", "Construct a DFA over {0, 1} that accepts strings with an even number of 0s and an odd number of 1s. Show the transition table."),
  Q("1.2", "Q5", "CAT 2", 8, "Fall", "2021–22", "F1+TF1", CH, "Descriptive", "Current", "Explain how a DFA can drive a lexical analyser. Give the DFA for identifiers that start with a letter followed by any number of letters or digits."),
  Q("1.3", "Q1", "FAT", 15, "Winter", "2023–24", "B2+TB2", CH, "Design", "Current", "Convert the NFA with ε-transitions (q0 –ε→ q1, q1 –a→ q2, q2 accepting) into an equivalent DFA using subset construction."),
  Q("1.3", "Q2", "CAT 1", 10, "Fall", "2020–21", "A2+TA2", CH, "Proof", "Older", "Prove that every language accepted by a nondeterministic finite automaton is also accepted by some deterministic finite automaton."),
  Q("2.1", "Q1", "CAT 2", 8, "Winter", "2023–24", "C1+TC1", CH, "Design", "Current", "Write regular expressions for (i) strings over {0, 1} with no two consecutive 1s and (ii) strings over {0, 1} that end with 01."),
  Q("2.1", "Q2", "FAT", 10, "Fall", "2022–23", "D2+TD2", CH, "Design", "Current", "Convert the regular expression (a+b)*abb to an NFA using Thompson’s construction, then to a DFA."),
  Q("2.2", "Q1", "CAT 2", 10, "Winter", "2022–23", "E1+TE1", CH, "Proof", "Current", "Using the pumping lemma, prove that L = { 0ⁿ1ⁿ | n ≥ 0 } is not regular."),
  Q("2.2", "Q2", "FAT", 10, "Fall", "2021–22", "A2+TA2", VL, "Proof", "Current", "Show that L = { ww | w ∈ {a, b}* } is not a regular language."),
  Q("2.3", "Q1", "CAT 2", 5, "Winter", "2021–22", "B1+TB1", CH, "Proof", "Unmapped", "Prove that regular languages are closed under complement and under intersection."),
  Q("3.1", "Q1", "CAT 2", 8, "Winter", "2023–24", "D1+TD1", CH, "Design", "Current", "Design a CFG for L = { aⁿb²ⁿ | n ≥ 1 } and derive the string aabbbb using a leftmost derivation."),
  Q("3.1", "Q2", "FAT", 10, "Fall", "2022–23", "E2+TE2", CH, "Descriptive", "Current", "Draw the parse tree for id + id * id using E → E + T | T, T → T * F | F, F → id, and write its rightmost derivation."),
  Q("3.2", "Q1", "CAT 2", 10, "Winter", "2022–23", "F1+TF1", CH, "Descriptive", "Current", "Show that the grammar S → SS | a | b is ambiguous and give an equivalent unambiguous grammar."),
  Q("3.2", "Q2", "FAT", 15, "Fall", "2021–22", "A1+TA1", CH, "Design", "Current", "Convert S → AB, A → aA | ε, B → bB | b to Chomsky Normal Form after removing ε- and unit productions."),
  Q("4.1", "Q1", "CAT 2", 10, "Winter", "2023–24", "A2+TA2", CH, "Design", "Current", "Construct a PDA that accepts L = { w c wᴿ | w ∈ {a, b}* } by final state."),
  Q("4.1", "Q2", "FAT", 15, "Fall", "2022–23", "B1+TB1", CH, "Design", "Current", "Design a PDA that accepts strings with equal numbers of a’s and b’s, and trace the string aabb."),
  Q("4.2", "Q1", "FAT", 15, "Fall", "2019–20", "C2+TC2", CH, "Descriptive", "Older", "Describe the construction of a PDA from a given CFG and illustrate it for S → aSb | ab."),
  Q("5.1", "Q1", "FAT", 15, "Winter", "2023–24", "D2+TD2", CH, "Design", "Current", "Design a Turing machine that accepts L = { aⁿbⁿcⁿ | n ≥ 1 } and trace it for aabbcc."),
  Q("5.1", "Q2", "CAT 2", 10, "Fall", "2022–23", "E1+TE1", VL, "Design", "Current", "Construct a Turing machine that computes the two’s complement of a binary number."),
  Q("5.2", "Q1", "FAT", 10, "Winter", "2022–23", "F2+TF2", CH, "Descriptive", "Unmapped", "Compare multi-tape, nondeterministic and universal Turing machines in terms of power and simulation cost."),
  Q("6.1", "Q1", "FAT", 10, "Winter", "2023–24", "A1+TA1", CH, "Proof", "Current", "Prove that the halting problem is undecidable using diagonalisation."),
  Q("6.1", "Q2", "CAT 2", 8, "Fall", "2019–20", "B2+TB2", CH, "Descriptive", "Older", "State Rice’s theorem and use it to show that deciding whether a Turing machine accepts the empty language is undecidable."),
];

export const FACETS: Facet[] = [
  { k: "campus", label: "Campus" },
  { k: "exam", label: "Exam type" },
  { k: "slot", label: "Slot" },
  { k: "sem", label: "Semester" },
  { k: "ay", label: "Academic year" },
  { k: "marks", label: "Marks" },
  { k: "qt", label: "Question type" },
];

export const BADGE_TEXT = {
  Current: "Current syllabus",
  Older: "Older syllabus · may not match",
  Unmapped: "Mapping pending",
} as const;

export const BADGE_ICON = {
  Current: "check",
  Older: "alert",
  Unmapped: "info",
} as const;

export interface TopicMapEntry {
  id: string;
  title: string;
  mod: Module;
  /** Short display label e.g. "2.1" – set when data comes from Supabase */
  displayIndex?: string;
}

export const TOPICS: Record<string, TopicMapEntry> = {};
MODULES.forEach((m) =>
  m.topics.forEach(([id, t]) => {
    TOPICS[id] = { id, title: t, mod: m };
  })
);

export const formatFacetValue = (k: keyof Question, v: string) => {
  if (k === "marks") return `${v} marks`;
  if (k === "sem") return `${v} Semester`;
  return v;
};

export const getQuestionSourceFile = (q: Question) =>
  q.sourceFilename ||
  q.paperName ||
  `${COURSE.code}_${q.exam.replace(" ", "")}_${
    q.sem === "Winter" ? "WS" : "FS"
  }${q.ay.replace("–", "-")}_${q.slot.split("+")[0]}.pdf`;

export const getQuestionHaystack = (
  q: Question,
  topicsMap?: Record<string, TopicMapEntry>
) => {
  // Use provided topicsMap (Supabase) or fall back to static TOPICS
  const resolvedTopics = topicsMap ?? TOPICS;
  const topic = resolvedTopics[q.t];
  let partsText = "";
  if (typeof q.parts === "string") {
    partsText = q.parts;
  } else if (q.parts && typeof q.parts === "object") {
    try {
      partsText = JSON.stringify(q.parts);
    } catch {
      partsText = "";
    }
  }

  return [
    q.text,
    partsText,
    q.n,
    q.exam,
    q.slot,
    q.qt,
    topic?.title || q.topicTitle || "",
    topic?.mod?.title || "",
    q.sourceFilename || q.paperName || getQuestionSourceFile(q),
    q.ay,
    q.cognitiveLevel || "",
    q.difficulty || "",
  ]
    .join(" ")
    .toLowerCase();
};

export const isQuestionMatching = (
  q: Question,
  query: string,
  activeFilters: Record<string, Set<string>>,
  skipFacetKey?: string,
  topicsMap?: Record<string, TopicMapEntry>
) => {
  if (query && !getQuestionHaystack(q, topicsMap).includes(query.trim().toLowerCase())) {
    return false;
  }
  for (const f of FACETS) {
    if (f.k === skipFacetKey) continue;
    const s = activeFilters[f.k as string];
    if (s && s.size > 0 && !s.has(q[f.k] as string)) {
      return false;
    }
  }
  return true;
};

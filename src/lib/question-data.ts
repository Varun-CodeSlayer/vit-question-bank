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
  curriculum: "Curriculum 2022",
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
  return [
    q.text,
    q.n,
    q.exam,
    q.slot,
    q.qt,
    topic?.title || q.topicTitle || "",
    topic?.mod?.title || "",
    q.paperName || getQuestionSourceFile(q),
    q.ay,
    q.cognitiveLevel || "",
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

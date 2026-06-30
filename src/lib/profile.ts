export const LEARNING_STYLES = [
  { id: "visual", label: "Visual", desc: "Diagrams, charts, colour, layout" },
  { id: "auditory", label: "Auditory", desc: "Spoken explanations, discussion" },
  { id: "reading_writing", label: "Reading / Writing", desc: "Notes, lists, written detail" },
  { id: "kinesthetic", label: "Kinesthetic", desc: "Examples, steps, hands-on practice" },
  { id: "multimodal", label: "Multimodal", desc: "A balanced mix of all styles" },
] as const;

export const ROLES = [
  { id: "learner", label: "Learner / Student" },
  { id: "educator", label: "Educator / Lecturer" },
  { id: "professional", label: "Working professional" },
  { id: "other", label: "Other" },
] as const;

export const PROVINCES = [
  "Eastern Cape", "Free State", "Gauteng", "KwaZulu-Natal", "Limpopo",
  "Mpumalanga", "Northern Cape", "North West", "Western Cape",
] as const;

export type LearningStyleId = (typeof LEARNING_STYLES)[number]["id"];
export type RoleId = (typeof ROLES)[number]["id"];

export interface Profile {
  id: string;
  full_name: string | null;
  learning_style: LearningStyleId;
  role: RoleId;
  institution: string | null;
  province: string | null;
  onboarded: boolean;
}

export function learningStyleGuidance(s: LearningStyleId): string {
  switch (s) {
    case "visual": return "Favour visual structure: short labelled blocks, comparisons, and references to diagrams. Suggest a visual aid when relevant.";
    case "auditory": return "Write in a natural spoken cadence, short sentences, with phrases that read well out loud.";
    case "reading_writing": return "Use full sentences, structured bullets and clear written detail. Define terms.";
    case "kinesthetic": return "Lead with concrete examples and step-by-step actions the reader can try.";
    case "multimodal": return "Balance written structure with concrete examples and references to visuals.";
  }
}

export function profileSystemContext(p: Profile | null): string {
  const role = p?.role ?? "professional";
  const style = p?.learning_style ?? "multimodal";
  const province = p?.province ?? "South Africa";
  const today = new Date().toLocaleDateString("en-ZA", {
    weekday: "long", year: "numeric", month: "long", day: "numeric",
    timeZone: "Africa/Johannesburg",
  });
  return [
    `Context: South African workplace/education (${province}). Today is ${today} (SAST).`,
    `Use British/South African English spelling, ZAR (R) for money, 24-hour time, and DD Month YYYY dates.`,
    `Audience: a ${role}.`,
    `Tailor output for a "${style}" learning style — ${learningStyleGuidance(style)}`,
    `Where culturally appropriate use local examples (e.g. CAPS curriculum, SARS, UCT/Wits/UJ, Joburg/Cape Town/Durban). Do not force them.`,
  ].join("\n");
}

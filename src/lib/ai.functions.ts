import { createServerFn } from "@tanstack/react-start";
import { generateText } from "ai";
import { z } from "zod";
import { createLovableAiGatewayProvider } from "./ai-gateway.server";

const MODEL = "google/gemini-3-flash-preview";

function getModel() {
  const key = process.env.LOVABLE_API_KEY;
  if (!key) throw new Error("Missing LOVABLE_API_KEY");
  return createLovableAiGatewayProvider(key)(MODEL);
}

function mapError(err: unknown): never {
  const message = err instanceof Error ? err.message : String(err);
  if (/429/.test(message)) throw new Error("Rate limit reached. Please try again in a moment.");
  if (/402/.test(message)) throw new Error("AI credits exhausted. Please add credits in your workspace settings.");
  throw new Error(message || "AI request failed");
}

const Ctx = z.object({
  context: z.string().max(2000).optional(),
}).partial();

function sysWithCtx(base: string, ctx?: string) {
  return ctx ? `${base}\n\nUser context to tailor the response:\n${ctx}` : base;
}

// --- Email ---
const EmailInput = Ctx.extend({
  recipient: z.string().min(1).max(200),
  purpose: z.string().min(1).max(2000),
  tone: z.enum(["professional", "friendly", "concise", "persuasive", "apologetic"]),
});
export const generateEmail = createServerFn({ method: "POST" })
  .inputValidator((i: unknown) => EmailInput.parse(i))
  .handler(async ({ data }) => {
    try {
      const { text } = await generateText({
        model: getModel(),
        system: sysWithCtx(
          "You are an expert workplace email writer. Produce a single complete email with a subject line on the first line prefixed by 'Subject: '. Then a blank line, then the body. No markdown, no commentary.",
          data.context,
        ),
        prompt: `Recipient: ${data.recipient}\nTone: ${data.tone}\nPurpose:\n${data.purpose}`,
      });
      return { email: text };
    } catch (e) { mapError(e); }
  });

// --- Notes ---
const NotesInput = Ctx.extend({ notes: z.string().min(10).max(20000) });
export const summarizeNotes = createServerFn({ method: "POST" })
  .inputValidator((i: unknown) => NotesInput.parse(i))
  .handler(async ({ data }) => {
    try {
      const { text } = await generateText({
        model: getModel(),
        system: sysWithCtx(
          "You summarise raw meeting notes into a structured brief. Output exactly these sections in plain text with these headers: 'Summary', 'Key Decisions', 'Action Items' (each as 'Owner — Task — Due'), 'Open Questions'. Short bullets prefixed '- '. No markdown bold, no preamble.",
          data.context,
        ),
        prompt: data.notes,
      });
      return { summary: text };
    } catch (e) { mapError(e); }
  });

// --- Tasks ---
const TaskInput = Ctx.extend({
  goal: z.string().min(3).max(2000),
  timeframe: z.string().min(1).max(100),
});
export const planTasks = createServerFn({ method: "POST" })
  .inputValidator((i: unknown) => TaskInput.parse(i))
  .handler(async ({ data }) => {
    try {
      const { text } = await generateText({
        model: getModel(),
        system: sysWithCtx(
          "You are a productivity coach. Given a goal and a timeframe, produce a focused, prioritised plan. Output plain text, numbered steps. For each step include: title, one-line rationale, estimated effort (S/M/L), and suggested day or order. Use SAST dates where relevant. End with a 'Focus first' line naming the single highest-leverage task. No markdown.",
          data.context,
        ),
        prompt: `Goal: ${data.goal}\nTimeframe: ${data.timeframe}`,
      });
      return { plan: text };
    } catch (e) { mapError(e); }
  });

// --- Presentation ---
export type Slide = { title: string; bullets: string[]; notes?: string };
const PresInput = Ctx.extend({
  topic: z.string().min(3).max(500),
  audience: z.string().max(200).optional(),
  slides: z.number().int().min(3).max(15).default(7),
});
export const generatePresentation = createServerFn({ method: "POST" })
  .inputValidator((i: unknown) => PresInput.parse(i))
  .handler(async ({ data }) => {
    try {
      const { text } = await generateText({
        model: getModel(),
        system: sysWithCtx(
          `You design clear, vibrant presentations. Output STRICT JSON only — no code fences, no commentary. Schema: {"title": string, "slides": [{"title": string, "bullets": string[3-6 short items], "notes": string}]}. Produce exactly the requested number of slides. First slide is a title slide, last slide is a summary/next-steps slide. Bullets are short (max ~12 words).`,
          data.context,
        ),
        prompt: `Topic: ${data.topic}\nAudience: ${data.audience ?? "general professional"}\nSlide count: ${data.slides}`,
      });
      const cleaned = text.trim().replace(/^```(?:json)?/i, "").replace(/```$/, "").trim();
      const parsed = JSON.parse(cleaned) as { title: string; slides: Slide[] };
      return parsed;
    } catch (e) { mapError(e); }
  });

// --- Diagram ---
const DiagInput = Ctx.extend({
  description: z.string().min(5).max(2000),
  kind: z.enum(["flowchart", "mindmap", "sequence", "timeline", "class"]).default("flowchart"),
});
export const generateDiagram = createServerFn({ method: "POST" })
  .inputValidator((i: unknown) => DiagInput.parse(i))
  .handler(async ({ data }) => {
    try {
      const { text } = await generateText({
        model: getModel(),
        system: sysWithCtx(
          `You write Mermaid diagrams. Output ONLY valid Mermaid source — no code fences, no commentary, no markdown. Use the requested diagram type. Keep node labels short (max 6 words). Use simple ASCII characters only — no emojis. Prefer top-down layout for flowcharts (graph TD).`,
          data.context,
        ),
        prompt: `Diagram type: ${data.kind}\nDescription:\n${data.description}`,
      });
      const cleaned = text.trim().replace(/^```(?:mermaid)?/i, "").replace(/```$/, "").trim();
      return { mermaid: cleaned };
    } catch (e) { mapError(e); }
  });

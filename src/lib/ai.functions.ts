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

// --- Email Generator ---
const EmailInput = z.object({
  recipient: z.string().min(1).max(200),
  purpose: z.string().min(1).max(2000),
  tone: z.enum(["professional", "friendly", "concise", "persuasive", "apologetic"]),
});

export const generateEmail = createServerFn({ method: "POST" })
  .inputValidator((input: unknown) => EmailInput.parse(input))
  .handler(async ({ data }) => {
    try {
      const { text } = await generateText({
        model: getModel(),
        system:
          "You are an expert workplace email writer. Produce a single complete email with a subject line on the first line prefixed by 'Subject: '. Then a blank line, then the body. No markdown, no commentary.",
        prompt: `Recipient: ${data.recipient}\nTone: ${data.tone}\nPurpose / context:\n${data.purpose}`,
      });
      return { email: text };
    } catch (e) {
      mapError(e);
    }
  });

// --- Meeting Notes Summarizer ---
const NotesInput = z.object({
  notes: z.string().min(10).max(20000),
});

export const summarizeNotes = createServerFn({ method: "POST" })
  .inputValidator((input: unknown) => NotesInput.parse(input))
  .handler(async ({ data }) => {
    try {
      const { text } = await generateText({
        model: getModel(),
        system:
          "You summarize raw meeting notes into a structured brief. Output exactly these sections in plain text with these headers: 'Summary', 'Key Decisions', 'Action Items' (each as 'Owner — Task — Due'), 'Open Questions'. Use short bullets prefixed with '- '. No markdown bold, no preamble.",
        prompt: data.notes,
      });
      return { summary: text };
    } catch (e) {
      mapError(e);
    }
  });

// --- Task Planner ---
const TaskInput = z.object({
  goal: z.string().min(3).max(2000),
  timeframe: z.string().min(1).max(100),
});

export const planTasks = createServerFn({ method: "POST" })
  .inputValidator((input: unknown) => TaskInput.parse(input))
  .handler(async ({ data }) => {
    try {
      const { text } = await generateText({
        model: getModel(),
        system:
          "You are a productivity coach. Given a goal and a timeframe, produce a focused, prioritized task plan. Output as plain text, numbered steps. For each step include: title, one-line rationale, estimated effort (S/M/L), and suggested day or order. End with a 'Focus first' line naming the single highest-leverage task. No markdown.",
        prompt: `Goal: ${data.goal}\nTimeframe: ${data.timeframe}`,
      });
      return { plan: text };
    } catch (e) {
      mapError(e);
    }
  });

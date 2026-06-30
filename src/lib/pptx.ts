import type { Slide } from "./ai.functions";

export async function downloadPptx(title: string, slides: Slide[]) {
  const { default: PptxGenJS } = await import("pptxgenjs");
  const pres = new PptxGenJS();
  pres.layout = "LAYOUT_WIDE";
  pres.title = title;
  const palette = ["F59E0B", "EC4899", "7C3AED", "0EA5E9", "10B981"];

  slides.forEach((s, idx) => {
    const slide = pres.addSlide();
    const color = palette[idx % palette.length];
    slide.background = { color: "FFFFFF" };
    slide.addShape("rect", { x: 0, y: 0, w: 13.33, h: 0.5, fill: { color } });
    slide.addText(s.title || `Slide ${idx + 1}`, {
      x: 0.5, y: 0.8, w: 12.3, h: 1.1, fontSize: 36, bold: true, color: "1F2937", fontFace: "Calibri",
    });
    const bullets = (s.bullets ?? []).map((b) => ({ text: b, options: { bullet: true } }));
    if (bullets.length) {
      slide.addText(bullets, {
        x: 0.6, y: 2.1, w: 12.1, h: 4.5, fontSize: 22, color: "374151", fontFace: "Calibri", paraSpaceAfter: 8,
      });
    }
    if (s.notes) slide.addNotes(s.notes);
    slide.addText(`${idx + 1} / ${slides.length}  ·  Sawubona AI`, {
      x: 0.5, y: 7.0, w: 12.3, h: 0.3, fontSize: 10, color: "9CA3AF", align: "right",
    });
  });

  await pres.writeFile({ fileName: `${title.replace(/[^a-z0-9-]+/gi, "_") || "presentation"}.pptx` });
}

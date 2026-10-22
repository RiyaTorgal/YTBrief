import type { Summary } from "@/lib/api";

// jsPDF is loaded on demand so it never runs during server rendering.
// Note: jsPDF's built-in Helvetica covers Latin text (incl. Spanish/French accents) only.
export async function downloadSummaryPdf(s: Summary) {
  const { jsPDF } = await import("jspdf");
  const doc = new jsPDF({ unit: "mm", format: "a4" });
  const W = doc.internal.pageSize.getWidth();
  const H = doc.internal.pageSize.getHeight();
  const M = 16;
  const maxW = W - M * 2;
  let y = M;

  const write = (text: string, size: number, opts: { bold?: boolean; color?: [number, number, number]; gap?: number; indent?: number } = {}) => {
    doc.setFont("helvetica", opts.bold ? "bold" : "normal");
    doc.setFontSize(size);
    doc.setTextColor(...(opts.color ?? [40, 40, 45]));
    const indent = opts.indent ?? 0;
    const lh = size * 0.5;
    for (const line of doc.splitTextToSize(text, maxW - indent) as string[]) {
      if (y + lh > H - M) { doc.addPage(); y = M; }
      doc.text(line, M + indent, y);
      y += lh;
    }
    y += opts.gap ?? 3;
  };

  write("YTBrief", 10, { bold: true, color: [229, 57, 53], gap: 4 });
  write(s.video.title, 18, { bold: true, gap: 2 });
  write(`${s.video.channel} · ${s.video.duration} · ${s.video.views} views`, 10, { color: [115, 115, 115] });
  write(s.video.url, 9, { color: [229, 57, 53], gap: 8 });

  if (s.tldr) { write("Summary", 13, { bold: true, color: [229, 57, 53] }); write(s.tldr, 11, { gap: 6 }); }
  if (s.takeaways.length) {
    write("Key takeaways", 13, { bold: true, color: [229, 57, 53] });
    s.takeaways.forEach((t) => write(`•  ${t}`, 11, { indent: 2, gap: 2 }));
    y += 4;
  }
  if (s.detailed) { write("Detailed summary", 13, { bold: true, color: [229, 57, 53] }); write(s.detailed, 11, { gap: 6 }); }
  if (s.chapterSummaries.length) {
    write("By chapter", 13, { bold: true, color: [229, 57, 53] });
    s.chapterSummaries.forEach((c) => { write(c.title, 11, { bold: true, gap: 1 }); write(c.text, 11, { gap: 4 }); });
  }

  const safe = s.video.title.replace(/[^\w\- ]+/g, "").trim().slice(0, 60) || "summary";
  doc.save(`${safe}.pdf`);
}

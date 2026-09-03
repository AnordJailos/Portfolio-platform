/**
 * lib/resume.ts
 * ----------------------------------------------------------------------------
 * Extracts text from public/resume.pdf so it can be embedded for the AI
 * assistant, same as Bio/FAQs/Projects/Posts. Called from
 * lib/embeddings.ts's syncKnowledgeBase() — not a standalone route.
 * ----------------------------------------------------------------------------
 */
import fs from "fs";
import path from "path";

const MIN_USABLE_TEXT_LENGTH = 50; // below this, treat it as "no real text layer" (e.g. a scanned image PDF)

/**
 * Returns the resume's extracted text, or null if there's no usable resume
 * to index (file missing, or a PDF with no real text layer). Never throws —
 * a missing/bad resume shouldn't fail the rest of the knowledge-base sync.
 */
export async function extractResumeText(): Promise<string | null> {
  const filePath = path.join(process.cwd(), "public", "ANORD_JAILOS_RESUME.pdf");

  if (!fs.existsSync(filePath)) {
    console.warn("No resume found at public/ANORD_JAILOS_RESUME.pdf — skipping resume indexing.");
    return null;
  }

  try {
    // Lazy require: keeps pdf-parse out of the bundle for every route that
    // imports lib/embeddings.ts, only pulled in when a sync actually runs.
    const pdfParse = (await import("pdf-parse")).default;
    const buffer = fs.readFileSync(filePath);
    const result = await pdfParse(buffer);
    const text = result.text?.trim() ?? "";

    if (text.length < MIN_USABLE_TEXT_LENGTH) {
      console.warn(
        `public/ANORD_JAILOS_RESUME.pdf produced only ${text.length} characters of text — likely a scanned image with no text layer. Skipping.`
      );
      return null;
    }

    return text;
  } catch (err) {
    console.error("Failed to parse public/ANORD_JAILOS_RESUME.pdf:", err);
    return null;
  }
}

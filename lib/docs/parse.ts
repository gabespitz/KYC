/**
 * Document parsing for legal docs.
 *
 * Supports PDF (via pdf-parse) and DOCX (via mammoth). For other types we
 * surface the file as plain text if possible, or empty string if not.
 *
 * Returns extracted text plus a stable list of clause IDs derived from
 * heading numbering when present (e.g. "7.2 Termination" -> "sec-7.2").
 */

export interface ParsedDocument {
  text: string;
  pageCount?: number;
  clauses: Array<{ id: string; heading: string; offset: number }>;
}

const HEADING_RE = /^(\d+(?:\.\d+){0,3})\s+([A-Z][^\n]{2,80})$/gm;

function extractClauses(text: string): ParsedDocument["clauses"] {
  const out: ParsedDocument["clauses"] = [];
  let m: RegExpExecArray | null;
  HEADING_RE.lastIndex = 0;
  while ((m = HEADING_RE.exec(text)) !== null) {
    out.push({
      id: `sec-${m[1]}`,
      heading: `${m[1]} ${m[2]}`,
      offset: m.index,
    });
  }
  return out;
}

export async function parseDocument(
  buffer: Buffer,
  mimeType: string,
  fileName: string
): Promise<ParsedDocument> {
  const lower = fileName.toLowerCase();
  if (mimeType === "application/pdf" || lower.endsWith(".pdf")) {
    return parsePdf(buffer);
  }
  if (
    mimeType ===
      "application/vnd.openxmlformats-officedocument.wordprocessingml.document" ||
    lower.endsWith(".docx")
  ) {
    return parseDocx(buffer);
  }
  if (mimeType.startsWith("text/") || lower.endsWith(".txt") || lower.endsWith(".md")) {
    const text = buffer.toString("utf8");
    return { text, clauses: extractClauses(text) };
  }
  return { text: "", clauses: [] };
}

async function parsePdf(buffer: Buffer): Promise<ParsedDocument> {
  // pdf-parse is CJS; require at runtime to avoid bundling issues.
  const pdfParse = require("pdf-parse") as (
    b: Buffer
  ) => Promise<{ text: string; numpages: number }>;
  const result = await pdfParse(buffer);
  const text = normalizeWhitespace(result.text);
  return {
    text,
    pageCount: result.numpages,
    clauses: extractClauses(text),
  };
}

async function parseDocx(buffer: Buffer): Promise<ParsedDocument> {
  const mammoth = require("mammoth") as {
    extractRawText: (input: { buffer: Buffer }) => Promise<{ value: string }>;
  };
  const result = await mammoth.extractRawText({ buffer });
  const text = normalizeWhitespace(result.value);
  return { text, clauses: extractClauses(text) };
}

function normalizeWhitespace(s: string): string {
  return s
    .replace(/\r\n/g, "\n")
    .replace(/[ \t]+\n/g, "\n")
    .replace(/\n{3,}/g, "\n\n")
    .trim();
}

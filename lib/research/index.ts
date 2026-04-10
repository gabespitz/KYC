import type { ResearchReport } from "../claude/schemas";

export interface ResearchInput {
  legalName: string;
  website?: string | null;
  industry?: string | null;
  contactName?: string | null;
  contactEmail?: string | null;
  notes?: string | null;
}

export interface ResearchResult {
  report: ResearchReport;
  modelUsed: string;
  toolCallCount: number;
  searchedUrls: string[];
}

export interface ResearchSource {
  name: string;
  run(input: ResearchInput): Promise<ResearchResult>;
}

import { ClaudeWebResearchSource } from "./claude-web";

let _source: ResearchSource | null = null;

export function getResearchSource(): ResearchSource {
  if (_source) return _source;
  _source = new ClaudeWebResearchSource();
  return _source;
}

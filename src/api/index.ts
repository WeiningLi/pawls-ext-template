export interface Token {
  x: number;
  y: number;
  height: number;
  width: number;
  text: string;
}

interface Page {
  index: number;
  width: number;
  height: number;
}

export interface PageTokens {
  page: Page;
  tokens: Token[];
}

function docURL(sha: string): string {
  return `/api/doc/${sha}`;
}

export function pdfURL(sha: string): string {
  return `${docURL(sha)}/pdf`;
}

export interface Label {
  text: string;
  color: string;
}

export interface PaperStatus {
  sha: string;
  name: string;
  annotations: number;
  relations: number;
  finished: boolean;
  junk: boolean;
  comments: string;
  completedAt?: Date;
}

export interface Allocation {
  papers: PaperStatus[];
  hasAllocatedPapers: boolean;
}

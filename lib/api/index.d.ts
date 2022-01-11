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
export declare function pdfURL(sha: string): string;
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
export {};

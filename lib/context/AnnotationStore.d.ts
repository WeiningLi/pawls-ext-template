/// <reference types="react" />
import { Bounds } from './PDFStore';
import { Label } from '../api';
export interface TokenId {
    pageIndex: number;
    tokenIndex: number;
}
export declare class RelationGroup {
    sourceIds: string[];
    targetIds: string[];
    label: Label;
    constructor(sourceIds: string[], targetIds: string[], label: Label);
    updateForAnnotationDeletion(a: Annotation): RelationGroup | undefined;
    static fromObject(obj: RelationGroup): RelationGroup;
}
export declare class Annotation {
    bounds: Bounds;
    readonly page: number;
    readonly label: Label;
    readonly tokens: TokenId[] | null;
    readonly id: string;
    constructor(bounds: Bounds, page: number, label: Label, tokens?: TokenId[] | null, id?: string | undefined);
    toString(): string;
    /**
     * Returns a deep copy of the provided Annotation with the applied
     * changes.
     */
    update(delta?: Partial<Annotation>): Annotation;
    static fromObject(obj: Annotation): Annotation;
}
export declare class PdfAnnotations {
    readonly annotations: Annotation[];
    readonly relations: RelationGroup[];
    readonly unsavedChanges: boolean;
    constructor(annotations: Annotation[], relations: RelationGroup[], unsavedChanges?: boolean);
    saved(): PdfAnnotations;
    withNewAnnotation(a: Annotation): PdfAnnotations;
    withNewRelation(r: RelationGroup): PdfAnnotations;
    deleteAnnotation(a: Annotation): PdfAnnotations;
    undoAnnotation(): PdfAnnotations;
}
interface _AnnotationStore {
    labels: Label[];
    activeLabel?: Label;
    setActiveLabel: (label: Label) => void;
    relationLabels: Label[];
    activeRelationLabel?: Label;
    setActiveRelationLabel: (label: Label) => void;
    pdfAnnotations: PdfAnnotations;
    setPdfAnnotations: (t: PdfAnnotations) => void;
    selectedAnnotations: Annotation[];
    setSelectedAnnotations: (t: Annotation[]) => void;
    freeFormAnnotations: boolean;
    toggleFreeFormAnnotations: (state: boolean) => void;
    hideLabels: boolean;
    setHideLabels: (state: boolean) => void;
}
export declare const AnnotationStore: import("react").Context<_AnnotationStore>;
export {};

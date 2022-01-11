/// <reference types="react" />
import { PDFPageProxy, PDFDocumentProxy } from '@types/pdfjs-dist/types/display/api';
import { Token, Label } from '../api';
import { Annotation } from './AnnotationStore';
export declare type Optional<T> = T | undefined;
export interface Bounds {
    left: number;
    top: number;
    right: number;
    bottom: number;
}
/**
 * Returns the provided bounds in their normalized form. Normalized means that the left
 * coordinate is always less than the right coordinate, and that the top coordinate is always
 * left than the bottom coordinate.
 *
 * This is required because objects in the DOM are positioned and sized by setting their top-left
 * corner, width and height. This means that when a user composes a selection and moves to the left,
 * or up, from where they started might result in a negative width and/or height. We don't normalize
 * these values as we're tracking the mouse as it'd result in the wrong visual effect. Instead we
 * rotate the bounds we render on the appropriate axis. This means we need to account for this
 * later when calculating what tokens the bounds intersect with.
 */
export declare function normalizeBounds(b: Bounds): Bounds;
export declare function getNewAnnotation(page: PDFPageInfo, selection: Bounds, activeLabel: Label, freeform: boolean): Optional<Annotation>;
export declare class PDFPageInfo {
    readonly page: PDFPageProxy;
    readonly tokens: Token[];
    bounds?: Bounds | undefined;
    constructor(page: PDFPageProxy, tokens?: Token[], bounds?: Bounds | undefined);
    getFreeFormAnnotationForBounds(selection: Bounds, label: Label): Annotation;
    getAnnotationForBounds(selection: Bounds, label: Label): Optional<Annotation>;
    getScaledTokenBounds(t: Token): Bounds;
    getTokenBounds(t: Token): Bounds;
    getScaledBounds(b: Bounds): Bounds;
    get scale(): number;
}
interface _PDFStore {
    pages?: PDFPageInfo[];
    doc?: PDFDocumentProxy;
    onError: (err: Error) => void;
}
export declare const PDFStore: import("react").Context<_PDFStore>;
export {};

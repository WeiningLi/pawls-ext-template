import React from 'react';
import { Bounds, TokenId, PDFPageInfo, Annotation } from '../context';
interface SelectionBoundaryProps {
    color: string;
    bounds: Bounds;
    selected: boolean;
    children?: React.ReactNode;
    annotationId?: string;
    onClick?: () => void;
}
export declare const SelectionBoundary: ({ color, bounds, children, onClick, selected, }: SelectionBoundaryProps) => JSX.Element;
interface SelectionTokenProps {
    pageInfo: PDFPageInfo;
    tokens: TokenId[] | null;
}
export declare const SelectionTokens: ({ pageInfo, tokens }: SelectionTokenProps) => JSX.Element;
interface SelectionProps {
    pageInfo: PDFPageInfo;
    annotation: Annotation;
    showInfo?: boolean;
}
export declare const Selection: ({ pageInfo, annotation, showInfo }: SelectionProps) => JSX.Element;
export {};

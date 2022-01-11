"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    Object.defineProperty(o, k2, { enumerable: true, get: function() { return m[k]; } });
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.PDF = void 0;
const react_1 = __importStar(require("react"));
const styled_components_1 = __importDefault(require("styled-components"));
const api_1 = require("pdfjs-dist/types/display/api");
const context_1 = require("../context");
const components_1 = require("../components");
const Selection_1 = require("./Selection");
class PDFPageRenderer {
    constructor(page, canvas, onError) {
        this.page = page;
        this.canvas = canvas;
        this.onError = onError;
    }
    cancelCurrentRender() {
        if (this.currentRenderTask === undefined) {
            return;
        }
        this.currentRenderTask.promise.then(() => { }, (err) => {
            if (err instanceof Error && err.message.indexOf('Rendering cancelled') !== -1) {
                // Swallow the error that's thrown when the render is canceled.
                return;
            }
            const e = err instanceof Error ? err : new Error(err);
            this.onError(e);
        });
        this.currentRenderTask.cancel();
    }
    render(scale) {
        console.log('pdfjs', this.page);
        const viewport = this.page.getViewport({ scale });
        this.canvas.height = viewport.height;
        this.canvas.width = viewport.width;
        const canvasContext = this.canvas.getContext('2d');
        if (canvasContext === null) {
            throw new Error('No canvas context');
        }
        this.currentRenderTask = this.page.render({ canvasContext, viewport });
        return this.currentRenderTask;
    }
    rescaleAndRender(scale) {
        this.cancelCurrentRender();
        return this.render(scale);
    }
}
function getPageBoundsFromCanvas(canvas) {
    if (canvas.parentElement === null) {
        throw new Error('No canvas parent');
    }
    const parent = canvas.parentElement;
    const parentStyles = getComputedStyle(canvas.parentElement);
    const leftPadding = parseFloat(parentStyles.paddingLeft || '0');
    const left = parent.offsetLeft + leftPadding;
    const topPadding = parseFloat(parentStyles.paddingTop || '0');
    const top = parent.offsetTop + topPadding;
    const parentWidth = parent.clientWidth - leftPadding - parseFloat(parentStyles.paddingRight || '0');
    const parentHeight = parent.clientHeight - topPadding - parseFloat(parentStyles.paddingBottom || '0');
    return {
        left,
        top,
        right: left + parentWidth,
        bottom: top + parentHeight,
    };
}
const Page = ({ pageInfo, onError }) => {
    const canvasRef = react_1.useRef(null);
    const [isVisible, setIsVisible] = react_1.useState(false);
    const [scale, setScale] = react_1.useState(1);
    const annotationStore = react_1.useContext(context_1.AnnotationStore);
    const containerRef = react_1.useRef(null);
    const [selection, setSelection] = react_1.useState();
    const annotations = annotationStore.pdfAnnotations.annotations.filter((a) => a.page === pageInfo.page.pageNumber - 1);
    react_1.useEffect(() => {
        try {
            const determinePageVisiblity = () => {
                if (canvasRef.current !== null) {
                    const windowTop = 0;
                    const windowBottom = window.innerHeight;
                    const rect = canvasRef.current.getBoundingClientRect();
                    setIsVisible(
                    // Top is in within window
                    (windowTop < rect.top && rect.top < windowBottom) ||
                        // Bottom is in within window
                        (windowTop < rect.bottom && rect.bottom < windowBottom) ||
                        // top is negative and bottom is +ve
                        (rect.top < windowTop && rect.bottom > windowTop));
                }
            };
            if (canvasRef.current === null) {
                onError(new Error('No canvas element'));
                return;
            }
            pageInfo.bounds = getPageBoundsFromCanvas(canvasRef.current);
            console.log('pdfjs0', pageInfo.page);
            var pdfjs1 = new api_1.PDFPageProxy(pageInfo.page._pageIndex, pageInfo.page._pageInfo, pageInfo.page._transport, pageInfo.page._ownerDocument, false);
            console.log('pdfjs1', pdfjs1);
            const renderer = new PDFPageRenderer(pageInfo.page, canvasRef.current, onError);
            renderer.render(pageInfo.scale);
            determinePageVisiblity();
            const handleResize = () => {
                if (canvasRef.current === null) {
                    onError(new Error('No canvas element'));
                    return;
                }
                pageInfo.bounds = getPageBoundsFromCanvas(canvasRef.current);
                renderer.rescaleAndRender(pageInfo.scale);
                setScale(pageInfo.scale);
                determinePageVisiblity();
            };
            window.addEventListener('resize', handleResize);
            window.addEventListener('scroll', determinePageVisiblity);
            return () => {
                window.removeEventListener('resize', handleResize);
                window.removeEventListener('scroll', determinePageVisiblity);
            };
        }
        catch (e) {
            onError(e);
        }
    }, [pageInfo, onError]); // We deliberately only run this once.
    return (react_1.default.createElement(PageAnnotationsContainer, { ref: containerRef, onMouseDown: (event) => {
            if (containerRef.current === null) {
                throw new Error('No Container');
            }
            if (!selection) {
                const left = event.pageX - containerRef.current.offsetLeft;
                const top = event.pageY - containerRef.current.offsetTop;
                setSelection({
                    left,
                    top,
                    right: left,
                    bottom: top,
                });
            }
        }, onMouseMove: selection
            ? (event) => {
                if (containerRef.current === null) {
                    throw new Error('No Container');
                }
                setSelection(Object.assign(Object.assign({}, selection), { right: event.pageX - containerRef.current.offsetLeft, bottom: event.pageY - containerRef.current.offsetTop }));
            }
            : undefined, onMouseUp: selection
            ? () => {
                if (annotationStore.activeLabel) {
                    const newAnnotation = context_1.getNewAnnotation(
                    // TODO(Mark): Change
                    pageInfo, selection, annotationStore.activeLabel, annotationStore.freeFormAnnotations);
                    if (newAnnotation) {
                        annotationStore.setPdfAnnotations(annotationStore.pdfAnnotations.withNewAnnotation(newAnnotation));
                    }
                }
                setSelection(undefined);
            }
            : undefined },
        react_1.default.createElement(PageCanvas, { ref: canvasRef }),
        // We only render the tokens if the page is visible, as rendering them all makes the
        // page slow and/or crash.
        scale &&
            isVisible &&
            annotations.map((annotation) => (react_1.default.createElement(components_1.Selection, { pageInfo: pageInfo, annotation: annotation, key: annotation.toString() }))),
        selection && annotationStore.activeLabel
            ? (() => {
                if (selection && annotationStore.activeLabel) {
                    const annotation = pageInfo.getAnnotationForBounds(context_1.normalizeBounds(selection), annotationStore.activeLabel);
                    const tokens = annotation &&
                        annotation.tokens &&
                        !annotationStore.freeFormAnnotations
                        ? annotation.tokens
                        : null;
                    return (react_1.default.createElement(react_1.default.Fragment, null,
                        react_1.default.createElement(Selection_1.SelectionBoundary, { color: annotationStore.activeLabel.color, bounds: selection, selected: false }),
                        react_1.default.createElement(Selection_1.SelectionTokens, { pageInfo: pageInfo, tokens: tokens })));
                }
            })()
            : null));
};
const PDF = ({ data }) => {
    // const pdfStore = useContext(PDFStore);
    var pdfStore = JSON.parse(data);
    console.log('store', pdfStore);
    pdfStore.onError = function (err) {
        console.error('Unexpected Error rendering PDF', err);
    };
    // TODO (@codeviking): Use error boundaries to capture these.
    if (!pdfStore.doc) {
        throw new Error('No Document');
    }
    if (!pdfStore.pages) {
        throw new Error('Document without Pages');
    }
    return (react_1.default.createElement(react_1.default.Fragment, null, pdfStore.pages.map((p) => {
        return react_1.default.createElement(Page, { key: p.page.pageNumber, pageInfo: p, onError: pdfStore.onError });
    })));
};
exports.PDF = PDF;
const PageAnnotationsContainer = styled_components_1.default.div(({ theme }) => `
    position: relative;
    box-shadow: 2px 2px 4px 0 rgba(0, 0, 0, 0.2);
    margin: 0 0 2;

    &:last-child {
        margin-bottom: 0;
    }
`);
const PageCanvas = styled_components_1.default.canvas `
    display: block;
`;
//# sourceMappingURL=PDF.js.map
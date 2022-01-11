(self["webpackChunkpawls_ext"] = self["webpackChunkpawls_ext"] || []).push([["lib_widget_js"],{

/***/ "./lib/ReactWidget.js":
/*!****************************!*\
  !*** ./lib/ReactWidget.js ***!
  \****************************/
/***/ (function(__unused_webpack_module, exports, __webpack_require__) {

"use strict";

var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", ({ value: true }));
const react_1 = __importDefault(__webpack_require__(/*! react */ "webpack/sharing/consume/default/react"));
const widget_model_1 = __webpack_require__(/*! ./hooks/widget-model */ "./lib/hooks/widget-model.js");
const components_1 = __webpack_require__(/*! ./components */ "./lib/components/index.js");
function ReactWidget(props) {
    const [data, setName] = widget_model_1.useModelState('value');
    console.log('prev', data);
    return (react_1.default.createElement("div", { className: "Widget" },
        react_1.default.createElement("h1", { onChange: () => setName(data) }, "Hello"),
        react_1.default.createElement(components_1.PDF, { data: data })));
}
function withModelContext(Component) {
    return (props) => (react_1.default.createElement(widget_model_1.WidgetModelContext.Provider, { value: props.model },
        react_1.default.createElement(Component, Object.assign({}, props))));
}
exports["default"] = withModelContext(ReactWidget);
//# sourceMappingURL=ReactWidget.js.map

/***/ }),

/***/ "./lib/components/PDF.js":
/*!*******************************!*\
  !*** ./lib/components/PDF.js ***!
  \*******************************/
/***/ (function(__unused_webpack_module, exports, __webpack_require__) {

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
Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.PDF = void 0;
const react_1 = __importStar(__webpack_require__(/*! react */ "webpack/sharing/consume/default/react"));
const styled_components_1 = __importDefault(__webpack_require__(/*! styled-components */ "./node_modules/styled-components/dist/styled-components.browser.esm.js"));
const context_1 = __webpack_require__(/*! ../context */ "./lib/context/index.js");
const components_1 = __webpack_require__(/*! ../components */ "./lib/components/index.js");
const Selection_1 = __webpack_require__(/*! ./Selection */ "./lib/components/Selection.js");
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

/***/ }),

/***/ "./lib/components/Selection.js":
/*!*************************************!*\
  !*** ./lib/components/Selection.js ***!
  \*************************************/
/***/ (function(__unused_webpack_module, exports, __webpack_require__) {

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
Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.Selection = exports.SelectionTokens = exports.SelectionBoundary = void 0;
const react_1 = __importStar(__webpack_require__(/*! react */ "webpack/sharing/consume/default/react"));
const styled_components_1 = __importStar(__webpack_require__(/*! styled-components */ "./node_modules/styled-components/dist/styled-components.browser.esm.js"));
const varnish_1 = __webpack_require__(/*! @allenai/varnish */ "webpack/sharing/consume/default/@allenai/varnish/@allenai/varnish");
const context_1 = __webpack_require__(/*! ../context */ "./lib/context/index.js");
const icons_1 = __webpack_require__(/*! @ant-design/icons */ "webpack/sharing/consume/default/@ant-design/icons/@ant-design/icons?6ab4");
function hexToRgb(hex) {
    const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
    if (!result) {
        throw new Error('Unable to parse color.');
    }
    return {
        r: parseInt(result[1], 16),
        g: parseInt(result[2], 16),
        b: parseInt(result[3], 16),
    };
}
function getBorderWidthFromBounds(bounds) {
    //
    const width = bounds.right - bounds.left;
    const height = bounds.bottom - bounds.top;
    if (width < 100 || height < 100) {
        return 1;
    }
    else {
        return 3;
    }
}
const SelectionBoundary = ({ color, bounds, children, onClick, selected, }) => {
    const width = bounds.right - bounds.left;
    const height = bounds.bottom - bounds.top;
    const rotateY = width < 0 ? -180 : 0;
    const rotateX = height < 0 ? -180 : 0;
    const rgbColor = hexToRgb(color);
    const border = getBorderWidthFromBounds(bounds);
    return (react_1.default.createElement("span", { onClick: (e) => {
            // Here we are preventing the default PdfAnnotationsContainer
            // behaviour of drawing a new bounding box if the shift key
            // is pressed in order to allow users to select multiple
            // annotations and associate them together with a relation.
            if (e.shiftKey && onClick) {
                e.stopPropagation();
                onClick();
            }
        }, onMouseDown: (e) => {
            if (e.shiftKey && onClick) {
                e.stopPropagation();
            }
        }, style: {
            position: 'absolute',
            left: `${bounds.left}px`,
            top: `${bounds.top}px`,
            width: `${Math.abs(width)}px`,
            height: `${Math.abs(height)}px`,
            transform: `rotateY(${rotateY}deg) rotateX(${rotateX}deg)`,
            transformOrigin: 'top left',
            border: `${border}px solid ${color}`,
            background: `rgba(${rgbColor.r}, ${rgbColor.g}, ${rgbColor.b}, ${selected ? 0.3 : 0.1})`,
        } }, children || null));
};
exports.SelectionBoundary = SelectionBoundary;
const TokenSpan = styled_components_1.default.span(({ theme, isSelected }) => `
    position: absolute;
    background: ${isSelected ? theme.color.B3 : 'none'};
    opacity: 0.2;
    border-radius: 3px;
`);
const SelectionTokens = ({ pageInfo, tokens }) => {
    return (react_1.default.createElement(react_1.default.Fragment, null, tokens &&
        tokens.map((t, i) => {
            const b = pageInfo.getScaledTokenBounds(pageInfo.tokens[t.tokenIndex]);
            return (react_1.default.createElement(TokenSpan, { key: i, isSelected: true, style: {
                    left: `${b.left}px`,
                    top: `${b.top}px`,
                    width: `${b.right - b.left}px`,
                    height: `${b.bottom - b.top}px`,
                    // Tokens don't respond to pointerEvents because
                    // they are ontop of the bounding boxes and the canvas,
                    // which do respond to pointer events.
                    pointerEvents: 'none',
                } }));
        })));
};
exports.SelectionTokens = SelectionTokens;
const EditLabelModal = ({ annotation, onHide }) => {
    const annotationStore = react_1.useContext(context_1.AnnotationStore);
    const [selectedLabel, setSelectedLabel] = react_1.useState(annotation.label);
    // There are onMouseDown listeners on the <canvas> that handle the
    // creation of new annotations. We use this function to prevent that
    // from being triggered when the user engages with other UI elements.
    const onMouseDown = (e) => {
        e.stopPropagation();
    };
    react_1.useEffect(() => {
        const onKeyPress = (e) => {
            // Ref to https://github.com/allenai/pawls/blob/0f3e5153241502eb68e46f582ed4b28112e2f765/ui/src/components/sidebar/Labels.tsx#L20
            // Numeric keys 1-9
            if (e.keyCode >= 49 && e.keyCode <= 57) {
                const index = Number.parseInt(e.key) - 1;
                if (index < annotationStore.labels.length) {
                    const selectedLabel = annotationStore.labels[index];
                    annotationStore.setPdfAnnotations(annotationStore.pdfAnnotations
                        .deleteAnnotation(annotation)
                        .withNewAnnotation(annotation.update({ label: selectedLabel })));
                    onHide();
                }
            }
        };
        window.addEventListener('keydown', onKeyPress);
        return () => {
            window.removeEventListener('keydown', onKeyPress);
        };
    }, [annotationStore, annotation]);
    return (react_1.default.createElement(varnish_1.Modal, { title: "Edit Label", onCancel: onHide, onOk: () => {
            // Remove the annotation and add a copy with the updated label.
            // TODO: This might have side-effects to the relation mechanism.
            // Some additional testing is warranted.
            annotationStore.setPdfAnnotations(annotationStore.pdfAnnotations
                .deleteAnnotation(annotation)
                .withNewAnnotation(annotation.update({ label: selectedLabel })));
            onHide();
        }, cancelButtonProps: { onMouseDown }, okButtonProps: { onMouseDown }, visible: true },
        react_1.default.createElement(varnish_1.Select, { value: selectedLabel.text, onMouseDown: onMouseDown, onChange: (labelText) => {
                const label = annotationStore.labels.find((l) => l.text === labelText);
                if (!label) {
                    return;
                }
                setSelectedLabel(label);
            }, style: { display: 'block' } }, annotationStore.labels.map((l) => (react_1.default.createElement(varnish_1.Select.Option, { value: l.text, key: l.text }, l.text))))));
};
const Selection = ({ pageInfo, annotation, showInfo = true }) => {
    const label = annotation.label;
    const theme = react_1.useContext(styled_components_1.ThemeContext);
    const [isEditLabelModalVisible, setIsEditLabelModalVisible] = react_1.useState(false);
    const annotationStore = react_1.useContext(context_1.AnnotationStore);
    let color;
    if (!label) {
        color = theme.color.N4.hex; // grey as the default.
    }
    else {
        color = label.color;
    }
    const bounds = pageInfo.getScaledBounds(annotation.bounds);
    const border = getBorderWidthFromBounds(bounds);
    const removeAnnotation = () => {
        annotationStore.setPdfAnnotations(annotationStore.pdfAnnotations.deleteAnnotation(annotation));
    };
    const onShiftClick = () => {
        const current = annotationStore.selectedAnnotations.slice(0);
        // Current contains this annotation, so we remove it.
        if (current.some((other) => other.id === annotation.id)) {
            const next = current.filter((other) => other.id !== annotation.id);
            annotationStore.setSelectedAnnotations(next);
            // Otherwise we add it.
        }
        else {
            current.push(annotation);
            annotationStore.setSelectedAnnotations(current);
        }
    };
    const selected = annotationStore.selectedAnnotations.includes(annotation);
    return (react_1.default.createElement(react_1.default.Fragment, null,
        react_1.default.createElement(exports.SelectionBoundary, { color: color, bounds: bounds, onClick: onShiftClick, selected: selected }, showInfo && !annotationStore.hideLabels ? (react_1.default.createElement(SelectionInfo, { border: border, color: color },
            react_1.default.createElement("span", null, label.text),
            react_1.default.createElement(icons_1.EditFilled, { onClick: (e) => {
                    e.stopPropagation();
                    setIsEditLabelModalVisible(true);
                }, onMouseDown: (e) => {
                    e.stopPropagation();
                } }),
            react_1.default.createElement(icons_1.CloseCircleFilled, { onClick: (e) => {
                    e.stopPropagation();
                    removeAnnotation();
                }, 
                // We have to prevent the default behaviour for
                // the pdf canvas here, in order to be able to capture
                // the click event.
                onMouseDown: (e) => {
                    e.stopPropagation();
                } }))) : null),
        // NOTE: It's important that the parent element of the tokens
        // is the PDF canvas, because we need their absolute position
        // to be relative to that and not another absolute/relatively
        // positioned element. This is why SelectionTokens are not inside
        // SelectionBoundary.
        annotation.tokens ? (react_1.default.createElement(exports.SelectionTokens, { pageInfo: pageInfo, tokens: annotation.tokens })) : null,
        isEditLabelModalVisible ? (react_1.default.createElement(EditLabelModal, { annotation: annotation, onHide: () => setIsEditLabelModalVisible(false) })) : null));
};
exports.Selection = Selection;
const SelectionInfo = styled_components_1.default.div(({ border, color }) => `
        position: absolute;
        right: -${border}px;
        transform:translateY(-100%);
        border: ${border} solid  ${color};
        background: ${color};
        font-weight: bold;
        font-size: 12px;
        user-select: none;

        * {
            margin: 2px;
            vertical-align: middle;
        }
    `);
//# sourceMappingURL=Selection.js.map

/***/ }),

/***/ "./lib/components/index.js":
/*!*********************************!*\
  !*** ./lib/components/index.js ***!
  \*********************************/
/***/ (function(__unused_webpack_module, exports, __webpack_require__) {

"use strict";

var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    Object.defineProperty(o, k2, { enumerable: true, get: function() { return m[k]; } });
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __exportStar = (this && this.__exportStar) || function(m, exports) {
    for (var p in m) if (p !== "default" && !Object.prototype.hasOwnProperty.call(exports, p)) __createBinding(exports, m, p);
};
Object.defineProperty(exports, "__esModule", ({ value: true }));
__exportStar(__webpack_require__(/*! ./PDF */ "./lib/components/PDF.js"), exports);
__exportStar(__webpack_require__(/*! ./Selection */ "./lib/components/Selection.js"), exports);
//# sourceMappingURL=index.js.map

/***/ }),

/***/ "./lib/context/AnnotationStore.js":
/*!****************************************!*\
  !*** ./lib/context/AnnotationStore.js ***!
  \****************************************/
/***/ ((__unused_webpack_module, exports, __webpack_require__) => {

"use strict";

Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.AnnotationStore = exports.PdfAnnotations = exports.Annotation = exports.RelationGroup = void 0;
const react_1 = __webpack_require__(/*! react */ "webpack/sharing/consume/default/react");
const uuid_1 = __webpack_require__(/*! uuid */ "./node_modules/uuid/dist/esm-browser/index.js");
class RelationGroup {
    constructor(sourceIds, targetIds, label) {
        this.sourceIds = sourceIds;
        this.targetIds = targetIds;
        this.label = label;
    }
    updateForAnnotationDeletion(a) {
        const sourceEmpty = this.sourceIds.length === 0;
        const targetEmpty = this.targetIds.length === 0;
        const newSourceIds = this.sourceIds.filter((id) => id !== a.id);
        const newTargetIds = this.targetIds.filter((id) => id !== a.id);
        const nowSourceEmpty = this.sourceIds.length === 0;
        const nowTargetEmpty = this.targetIds.length === 0;
        // Only target had any annotations, now it has none,
        // so delete.
        if (sourceEmpty && nowTargetEmpty) {
            return undefined;
        }
        // Only source had any annotations, now it has none,
        // so delete.
        if (targetEmpty && nowSourceEmpty) {
            return undefined;
        }
        // Source was not empty, but now it is, so delete.
        if (!sourceEmpty && nowSourceEmpty) {
            return undefined;
        }
        // Target was not empty, but now it is, so delete.
        if (!targetEmpty && nowTargetEmpty) {
            return undefined;
        }
        return new RelationGroup(newSourceIds, newTargetIds, this.label);
    }
    static fromObject(obj) {
        return new RelationGroup(obj.sourceIds, obj.targetIds, obj.label);
    }
}
exports.RelationGroup = RelationGroup;
class Annotation {
    constructor(bounds, page, label, tokens = null, id = undefined) {
        this.bounds = bounds;
        this.page = page;
        this.label = label;
        this.tokens = tokens;
        this.id = id || uuid_1.v4();
    }
    toString() {
        return this.id;
    }
    /**
     * Returns a deep copy of the provided Annotation with the applied
     * changes.
     */
    update(delta = {}) {
        var _a, _b, _c, _d, _e;
        return new Annotation((_a = delta.bounds) !== null && _a !== void 0 ? _a : Object.assign({}, this.bounds), (_b = delta.page) !== null && _b !== void 0 ? _b : this.page, (_c = delta.label) !== null && _c !== void 0 ? _c : Object.assign({}, this.label), (_d = delta.tokens) !== null && _d !== void 0 ? _d : (_e = this.tokens) === null || _e === void 0 ? void 0 : _e.map((t) => Object.assign({}, t)), this.id);
    }
    static fromObject(obj) {
        return new Annotation(obj.bounds, obj.page, obj.label, obj.tokens, obj.id);
    }
}
exports.Annotation = Annotation;
class PdfAnnotations {
    constructor(annotations, relations, unsavedChanges = false) {
        this.annotations = annotations;
        this.relations = relations;
        this.unsavedChanges = unsavedChanges;
    }
    saved() {
        return new PdfAnnotations(this.annotations, this.relations, false);
    }
    withNewAnnotation(a) {
        return new PdfAnnotations(this.annotations.concat([a]), this.relations, true);
    }
    withNewRelation(r) {
        return new PdfAnnotations(this.annotations, this.relations.concat([r]), true);
    }
    deleteAnnotation(a) {
        const newAnnotations = this.annotations.filter((ann) => ann.id !== a.id);
        const newRelations = this.relations
            .map((r) => r.updateForAnnotationDeletion(a))
            .filter((r) => r !== undefined);
        return new PdfAnnotations(newAnnotations, newRelations, true);
    }
    undoAnnotation() {
        const popped = this.annotations.pop();
        if (!popped) {
            // No annotations, nothing to update
            return this;
        }
        const newRelations = this.relations
            .map((r) => r.updateForAnnotationDeletion(popped))
            .filter((r) => r !== undefined);
        return new PdfAnnotations(this.annotations, newRelations, true);
    }
}
exports.PdfAnnotations = PdfAnnotations;
exports.AnnotationStore = react_1.createContext({
    pdfAnnotations: new PdfAnnotations([], []),
    labels: [],
    activeLabel: undefined,
    setActiveLabel: (_) => {
        throw new Error('Unimplemented');
    },
    relationLabels: [],
    activeRelationLabel: undefined,
    setActiveRelationLabel: (_) => {
        throw new Error('Unimplemented');
    },
    selectedAnnotations: [],
    setSelectedAnnotations: (_) => {
        throw new Error('Unimplemented');
    },
    setPdfAnnotations: (_) => {
        throw new Error('Unimplemented');
    },
    freeFormAnnotations: false,
    toggleFreeFormAnnotations: (_) => {
        throw new Error('Unimplemented');
    },
    hideLabels: false,
    setHideLabels: (_) => {
        throw new Error('Unimplemented');
    },
});
//# sourceMappingURL=AnnotationStore.js.map

/***/ }),

/***/ "./lib/context/PDFStore.js":
/*!*********************************!*\
  !*** ./lib/context/PDFStore.js ***!
  \*********************************/
/***/ ((__unused_webpack_module, exports, __webpack_require__) => {

"use strict";

Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.PDFStore = exports.PDFPageInfo = exports.getNewAnnotation = exports.normalizeBounds = void 0;
const react_1 = __webpack_require__(/*! react */ "webpack/sharing/consume/default/react");
const AnnotationStore_1 = __webpack_require__(/*! ./AnnotationStore */ "./lib/context/AnnotationStore.js");
/**
 * Returns the provided bounds scaled by the provided factor.
 */
function scaled(bounds, scale) {
    return {
        left: bounds.left * scale,
        top: bounds.top * scale,
        right: bounds.right * scale,
        bottom: bounds.bottom * scale,
    };
}
/**
 * Computes a bound which contains all of the bounds passed as arguments.
 */
function spanningBound(bounds, padding = 3) {
    // Start with a bounding box for which any bound would be
    // contained within, meaning we immediately update maxBound.
    const maxBound = {
        left: Number.MAX_VALUE,
        top: Number.MAX_VALUE,
        right: 0,
        bottom: 0,
    };
    bounds.forEach((bound) => {
        maxBound.bottom = Math.max(bound.bottom, maxBound.bottom);
        maxBound.top = Math.min(bound.top, maxBound.top);
        maxBound.left = Math.min(bound.left, maxBound.left);
        maxBound.right = Math.max(bound.right, maxBound.right);
    });
    maxBound.top = maxBound.top - padding;
    maxBound.left = maxBound.left - padding;
    maxBound.right = maxBound.right + padding;
    maxBound.bottom = maxBound.bottom + padding;
    return maxBound;
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
function normalizeBounds(b) {
    const normalized = Object.assign({}, b);
    if (b.right < b.left) {
        const l = b.left;
        normalized.left = b.right;
        normalized.right = l;
    }
    if (b.bottom < b.top) {
        const t = b.top;
        normalized.top = b.bottom;
        normalized.bottom = t;
    }
    return normalized;
}
exports.normalizeBounds = normalizeBounds;
/**
 * Returns true if the provided bounds overlap.
 */
function doOverlap(a, b) {
    if (a.left >= b.right || a.right <= b.left) {
        return false;
    }
    else if (a.bottom <= b.top || a.top >= b.bottom) {
        return false;
    }
    return true;
}
function getNewAnnotation(page, selection, activeLabel, freeform) {
    let annotation;
    const normalized = normalizeBounds(selection);
    if (freeform) {
        annotation = page.getFreeFormAnnotationForBounds(normalized, activeLabel);
    }
    else {
        annotation = page.getAnnotationForBounds(normalized, activeLabel);
    }
    return annotation;
}
exports.getNewAnnotation = getNewAnnotation;
class PDFPageInfo {
    constructor(page, tokens = [], bounds) {
        this.page = page;
        this.tokens = tokens;
        this.bounds = bounds;
    }
    getFreeFormAnnotationForBounds(selection, label) {
        if (this.bounds === undefined) {
            throw new Error('Unknown Page Bounds');
        }
        // Here we invert the scale, because the user has drawn this bounding
        // box, so it is *already* scaled with respect to the client's view. For
        // the annotation, we want to remove this, because storing it with respect
        // to the PDF page's original scale means we can render it everywhere.
        const bounds = scaled(selection, 1 / this.scale);
        return new AnnotationStore_1.Annotation(bounds, this.page.pageNumber - 1, label);
    }
    getAnnotationForBounds(selection, label) {
        /* This function is quite complicated. Our objective here is to
           compute overlaps between a bounding box provided by a user and
           grobid token spans associated with a pdf. The complexity here is
           that grobid spans are relative to an absolute scale of the pdf,
           but our user's bounding box is relative to the pdf rendered in their
           client.

           The critical key here is that anything we *store* must be relative
           to the underlying pdf. So for example, inside the for loop, we are
           computing:

           whether a grobid token (tokenBound), scaled to the current scale of the
           pdf in the client (scaled(tokenBound, this.scale)), is overlapping with
           the bounding box drawn by the user (selection).

           But! Once we have computed this, we store the grobid tokens and the bound
           that contains all of them relative to the *original grobid tokens*.

           This means that the stored data is not tied to a particular scale, and we
           can re-scale it when we need to (mainly when the user resizes the browser window).
         */
        if (this.bounds === undefined) {
            throw new Error('Unknown Page Bounds');
        }
        const ids = [];
        const tokenBounds = [];
        for (let i = 0; i < this.tokens.length; i++) {
            const tokenBound = this.getTokenBounds(this.tokens[i]);
            if (doOverlap(scaled(tokenBound, this.scale), selection)) {
                ids.push({ pageIndex: this.page.pageNumber - 1, tokenIndex: i });
                tokenBounds.push(tokenBound);
            }
        }
        if (ids.length === 0) {
            return undefined;
        }
        const bounds = spanningBound(tokenBounds);
        return new AnnotationStore_1.Annotation(bounds, this.page.pageNumber - 1, label, ids);
    }
    getScaledTokenBounds(t) {
        return this.getScaledBounds(this.getTokenBounds(t));
    }
    getTokenBounds(t) {
        const b = {
            left: t.x,
            top: t.y,
            right: t.x + t.width,
            bottom: t.y + t.height,
        };
        return b;
    }
    getScaledBounds(b) {
        return scaled(b, this.scale);
    }
    get scale() {
        if (this.bounds === undefined) {
            throw new Error('Unknown Page Bounds');
        }
        const pdfPageWidth = this.page.view[2] - this.page.view[1];
        const domPageWidth = this.bounds.right - this.bounds.left;
        return domPageWidth / pdfPageWidth;
    }
}
exports.PDFPageInfo = PDFPageInfo;
exports.PDFStore = react_1.createContext({
    onError: (_) => {
        throw new Error('Unimplemented');
    },
});
//# sourceMappingURL=PDFStore.js.map

/***/ }),

/***/ "./lib/context/index.js":
/*!******************************!*\
  !*** ./lib/context/index.js ***!
  \******************************/
/***/ (function(__unused_webpack_module, exports, __webpack_require__) {

"use strict";

var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    Object.defineProperty(o, k2, { enumerable: true, get: function() { return m[k]; } });
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __exportStar = (this && this.__exportStar) || function(m, exports) {
    for (var p in m) if (p !== "default" && !Object.prototype.hasOwnProperty.call(exports, p)) __createBinding(exports, m, p);
};
Object.defineProperty(exports, "__esModule", ({ value: true }));
__exportStar(__webpack_require__(/*! ./AnnotationStore */ "./lib/context/AnnotationStore.js"), exports);
__exportStar(__webpack_require__(/*! ./PDFStore */ "./lib/context/PDFStore.js"), exports);
//# sourceMappingURL=index.js.map

/***/ }),

/***/ "./lib/hooks/widget-model.js":
/*!***********************************!*\
  !*** ./lib/hooks/widget-model.js ***!
  \***********************************/
/***/ ((__unused_webpack_module, exports, __webpack_require__) => {

"use strict";

Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.useModel = exports.useModelEvent = exports.useModelState = exports.WidgetModelContext = void 0;
const react_1 = __webpack_require__(/*! react */ "webpack/sharing/consume/default/react");
exports.WidgetModelContext = react_1.createContext(undefined);
// HOOKS
//============================================================================================
/**
 *
 * @param name property name in the Python model object.
 * @returns model state and set state function.
 */
function useModelState(name) {
    const model = useModel();
    const [state, setState] = react_1.useState(model === null || model === void 0 ? void 0 : model.get(name));
    useModelEvent(`change:${name}`, (model) => {
        setState(model.get(name));
    }, [name]);
    function updateModel(val, options) {
        model === null || model === void 0 ? void 0 : model.set(name, val, options);
        model === null || model === void 0 ? void 0 : model.save_changes();
    }
    return [state, updateModel];
}
exports.useModelState = useModelState;
/**
 * Subscribes a listener to the model event loop.
 * @param event String identifier of the event that will trigger the callback.
 * @param callback Action to perform when event happens.
 * @param deps Dependencies that should be kept up to date within the callback.
 */
function useModelEvent(event, callback, deps) {
    const model = useModel();
    const dependencies = deps === undefined ? [model] : [...deps, model];
    react_1.useEffect(() => {
        const callbackWrapper = (e) => model && callback(model, e);
        model === null || model === void 0 ? void 0 : model.on(event, callbackWrapper);
        return () => void (model === null || model === void 0 ? void 0 : model.unbind(event, callbackWrapper));
    }, dependencies);
}
exports.useModelEvent = useModelEvent;
/**
 * An escape hatch in case you want full access to the model.
 * @returns Python model
 */
function useModel() {
    return react_1.useContext(exports.WidgetModelContext);
}
exports.useModel = useModel;
//# sourceMappingURL=widget-model.js.map

/***/ }),

/***/ "./lib/version.js":
/*!************************!*\
  !*** ./lib/version.js ***!
  \************************/
/***/ ((__unused_webpack_module, exports, __webpack_require__) => {

"use strict";

// Copyright (c) 
// Distributed under the terms of the Modified BSD License.
Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.MODULE_NAME = exports.MODULE_VERSION = void 0;
// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-ignore
// eslint-disable-next-line @typescript-eslint/no-var-requires
const data = __webpack_require__(/*! ../package.json */ "./package.json");
/**
 * The _model_module_version/_view_module_version this package implements.
 *
 * The html widget manager assumes that this is the same as the npm package
 * version number.
 */
exports.MODULE_VERSION = data.version;
/*
 * The current package name.
 */
exports.MODULE_NAME = data.name;
//# sourceMappingURL=version.js.map

/***/ }),

/***/ "./lib/widget.js":
/*!***********************!*\
  !*** ./lib/widget.js ***!
  \***********************/
/***/ (function(__unused_webpack_module, exports, __webpack_require__) {

"use strict";

// Copyright (c) 
// Distributed under the terms of the Modified BSD License.
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.ExampleView = exports.ExampleModel = void 0;
const base_1 = __webpack_require__(/*! @jupyter-widgets/base */ "webpack/sharing/consume/default/@jupyter-widgets/base");
const ReactWidget_1 = __importDefault(__webpack_require__(/*! ./ReactWidget */ "./lib/ReactWidget.js"));
const react_1 = __importDefault(__webpack_require__(/*! react */ "webpack/sharing/consume/default/react"));
const react_dom_1 = __importDefault(__webpack_require__(/*! react-dom */ "webpack/sharing/consume/default/react-dom"));
const version_1 = __webpack_require__(/*! ./version */ "./lib/version.js");
// Import the CSS
__webpack_require__(/*! ../css/widget.css */ "./css/widget.css");
// Your widget state goes here. Make sure to update the corresponding
// Python state in example.py
const defaultModelProperties = {
    value: 'Hello World',
};
class ExampleModel extends base_1.DOMWidgetModel {
    defaults() {
        return Object.assign(Object.assign(Object.assign({}, super.defaults()), { _model_name: ExampleModel.model_name, _model_module: ExampleModel.model_module, _model_module_version: ExampleModel.model_module_version, _view_name: ExampleModel.view_name, _view_module: ExampleModel.view_module, _view_module_version: ExampleModel.view_module_version }), defaultModelProperties);
    }
}
exports.ExampleModel = ExampleModel;
ExampleModel.serializers = Object.assign({}, base_1.DOMWidgetModel.serializers);
ExampleModel.model_name = 'ExampleModel';
ExampleModel.model_module = version_1.MODULE_NAME;
ExampleModel.model_module_version = version_1.MODULE_VERSION;
ExampleModel.view_name = 'ExampleView'; // Set to null if no view
ExampleModel.view_module = version_1.MODULE_NAME; // Set to null if no view
ExampleModel.view_module_version = version_1.MODULE_VERSION;
class ExampleView extends base_1.DOMWidgetView {
    render() {
        this.el.classList.add('custom-widget');
        const component = react_1.default.createElement(ReactWidget_1.default, {
            model: this.model,
        });
        react_dom_1.default.render(component, this.el);
    }
}
exports.ExampleView = ExampleView;
//# sourceMappingURL=widget.js.map

/***/ }),

/***/ "./node_modules/css-loader/dist/cjs.js!./css/widget.css":
/*!**************************************************************!*\
  !*** ./node_modules/css-loader/dist/cjs.js!./css/widget.css ***!
  \**************************************************************/
/***/ ((module, exports, __webpack_require__) => {

// Imports
var ___CSS_LOADER_API_IMPORT___ = __webpack_require__(/*! ../node_modules/css-loader/dist/runtime/api.js */ "./node_modules/css-loader/dist/runtime/api.js");
exports = ___CSS_LOADER_API_IMPORT___(false);
// Module
exports.push([module.id, ".custom-widget {\n  padding: 0px 2px;\n}\n", ""]);
// Exports
module.exports = exports;


/***/ }),

/***/ "./css/widget.css":
/*!************************!*\
  !*** ./css/widget.css ***!
  \************************/
/***/ ((module, __unused_webpack_exports, __webpack_require__) => {

var api = __webpack_require__(/*! !../node_modules/style-loader/dist/runtime/injectStylesIntoStyleTag.js */ "./node_modules/style-loader/dist/runtime/injectStylesIntoStyleTag.js");
            var content = __webpack_require__(/*! !!../node_modules/css-loader/dist/cjs.js!./widget.css */ "./node_modules/css-loader/dist/cjs.js!./css/widget.css");

            content = content.__esModule ? content.default : content;

            if (typeof content === 'string') {
              content = [[module.id, content, '']];
            }

var options = {};

options.insert = "head";
options.singleton = false;

var update = api(content, options);



module.exports = content.locals || {};

/***/ }),

/***/ "./package.json":
/*!**********************!*\
  !*** ./package.json ***!
  \**********************/
/***/ ((module) => {

"use strict";
module.exports = JSON.parse('{"name":"pawls-ext","version":"0.1.0","description":"A Custom Jupyter Widget Library","keywords":["jupyter","jupyterlab","jupyterlab-extension","widgets"],"files":["lib/**/*.js","dist/*.js","css/*.css"],"homepage":"https://github.com//pawls-ext","bugs":{"url":"https://github.com//pawls-ext/issues"},"license":"BSD-3-Clause","author":{"name":"","email":""},"main":"lib/index.js","types":"./lib/index.d.ts","repository":{"type":"git","url":"https://github.com//pawls-ext"},"scripts":{"build":"yarn run build:lib && yarn run build:nbextension && yarn run build:labextension:dev","build:prod":"yarn run build:lib && yarn run build:nbextension && yarn run build:labextension","build:labextension":"jupyter labextension build .","build:labextension:dev":"jupyter labextension build --development True .","build:lib":"tsc","build:nbextension":"webpack","clean":"yarn run clean:lib && yarn run clean:nbextension && yarn run clean:labextension","clean:lib":"rimraf lib","clean:labextension":"rimraf pawls_ext/labextension","clean:nbextension":"rimraf pawls_ext/nbextension/static/index.js","lint":"eslint . --ext .ts,.tsx --fix","lint:check":"eslint . --ext .ts,.tsx","prepack":"yarn run build:lib","test":"jest","watch":"npm-run-all -p watch:*","watch:lib":"tsc -w","watch:nbextension":"webpack --watch --mode=development","watch:labextension":"jupyter labextension watch ."},"dependencies":{"@allenai/varnish":"^1.0.0","@ant-design/icons":"^4.7.0","@jupyter-widgets/base":"^1.1.10 || ^2.0.0 || ^3.0.0 || ^4.0.0","pdfjs-dist":"2.7.570","react":"^17.0.2","react-dom":"^17.0.2"},"devDependencies":{"@babel/core":"^7.5.0","@babel/preset-env":"^7.5.0","@babel/preset-react":"^7.14.5","@babel/preset-typescript":"^7.14.5","@jupyterlab/builder":"^3.0.0","@phosphor/application":"^1.6.0","@phosphor/widgets":"^1.6.0","@types/jest":"^26.0.0","@types/node":"^17.0.8","@types/pdfjs-dist":"^2.7.570","@types/react":"^17.0.11","@types/react-dom":"^17.0.8","@types/styled-components":"^5.1.19","@types/uuid":"^8.3.4","@types/webpack-env":"^1.13.6","@typescript-eslint/eslint-plugin":"^3.6.0","@typescript-eslint/parser":"^3.6.0","acorn":"^7.2.0","babel-loader":"^8.2.2","css-loader":"^3.2.0","eslint":"^7.4.0","eslint-config-prettier":"^6.11.0","eslint-plugin-prettier":"^3.1.4","fs-extra":"^7.0.0","identity-obj-proxy":"^3.0.0","jest":"^26.0.0","mkdirp":"^0.5.1","npm-run-all":"^4.1.3","prettier":"^2.0.5","rimraf":"^2.6.2","source-map-loader":"^1.1.3","style-loader":"^1.0.0","styled-components":"^5.3.3","ts-jest":"^26.0.0","ts-loader":"^8.0.0","typescript":"~4.1.3","uuid":"^8.3.2","webpack":"^5.0.0","webpack-cli":"^4.0.0"},"babel":{"presets":["@babel/preset-env","@babel/preset-react","@babel/preset-typescript"]},"jupyterlab":{"extension":"lib/plugin","outputDir":"pawls_ext/labextension/","sharedPackages":{"@jupyter-widgets/base":{"bundled":false,"singleton":true}}}}');

/***/ })

}]);
//# sourceMappingURL=lib_widget_js.6219976899763855b4c1.js.map
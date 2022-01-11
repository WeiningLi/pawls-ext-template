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
Object.defineProperty(exports, "__esModule", { value: true });
exports.Selection = exports.SelectionTokens = exports.SelectionBoundary = void 0;
const react_1 = __importStar(require("react"));
const styled_components_1 = __importStar(require("styled-components"));
const varnish_1 = require("@allenai/varnish");
const context_1 = require("../context");
const icons_1 = require("@ant-design/icons");
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
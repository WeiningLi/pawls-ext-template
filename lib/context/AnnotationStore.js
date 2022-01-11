"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.AnnotationStore = exports.PdfAnnotations = exports.Annotation = exports.RelationGroup = void 0;
const react_1 = require("react");
const uuid_1 = require("uuid");
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
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.pdfURL = void 0;
function docURL(sha) {
    return `/api/doc/${sha}`;
}
function pdfURL(sha) {
    return `${docURL(sha)}/pdf`;
}
exports.pdfURL = pdfURL;
//# sourceMappingURL=index.js.map
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.truncateText = void 0;
// Función auxiliar para truncar texto
const truncateText = (text, maxWidth, font, fontSize) => {
    let truncated = text;
    while (font.widthOfTextAtSize(truncated, fontSize) > maxWidth && truncated.length > 0) {
        truncated = truncated.slice(0, -1);
    }
    if (truncated !== text && truncated.length > 3) {
        truncated = truncated.slice(0, -3) + '...';
    }
    return truncated;
};
exports.truncateText = truncateText;
//# sourceMappingURL=truncateText.js.map
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.formatTipoDoc = void 0;
const formatTipoDoc = (tipoDoc) => {
    let titleDocument = '';
    if (tipoDoc === 1)
        titleDocument = 'Facturas';
    if (tipoDoc === 2)
        titleDocument = 'Remisión';
    return titleDocument;
};
exports.formatTipoDoc = formatTipoDoc;
//# sourceMappingURL=tipoDocFormat.js.map
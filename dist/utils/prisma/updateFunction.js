"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.buildUpdate = void 0;
function buildUpdate(data, allowedFields) {
    // Si se especifican campos permitidos, filtramos
    const filteredData = allowedFields
        ? Object.fromEntries(Object.entries(data).filter(([key]) => allowedFields.includes(key)))
        : data;
    return filteredData;
}
exports.buildUpdate = buildUpdate;
//# sourceMappingURL=updateFunction.js.map
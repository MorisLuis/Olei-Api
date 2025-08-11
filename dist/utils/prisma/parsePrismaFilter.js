"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.parsePrismaFilter = void 0;
const parsePrismaFilter = (filterField, filterValue) => {
    let filters = [];
    if (filterField && filterValue) {
        const fields = filterField.split(',').map(f => f.trim());
        const values = filterValue.split(',').map(v => v.trim());
        filters = fields.map((field, idx) => ({
            field,
            value: values[idx] || ''
        }));
    }
    return filters;
};
exports.parsePrismaFilter = parsePrismaFilter;
//# sourceMappingURL=parsePrismaFilter.js.map
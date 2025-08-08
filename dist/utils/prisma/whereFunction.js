"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.buildWhereCondition = void 0;
const buildWhereCondition = (filters, containsFields = []) => {
    const where = {};
    for (const key in filters) {
        const value = filters[key];
        if (value !== undefined && value !== null) {
            if (containsFields.includes(key) && typeof value === "string") {
                where[key] = { contains: value };
            }
            else {
                where[key] = value;
            }
        }
    }
    return where;
};
exports.buildWhereCondition = buildWhereCondition;
//# sourceMappingURL=whereFunction.js.map
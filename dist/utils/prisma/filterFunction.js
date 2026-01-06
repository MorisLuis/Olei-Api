"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.buildFilters = void 0;
function buildFilters(filters) {
    const andConditions = filters
        .map(({ field, value }) => {
        if (field.includes('.')) {
            const [relation, relField] = field.split('.');
            return isNaN(Number(value))
                ? { [relation]: { [relField]: { contains: value } } }
                : { [relation]: { [relField]: Number(value) } };
        }
        else {
            return isNaN(Number(value))
                ? { [field]: { contains: value } }
                : { [field]: Number(value) };
        }
    })
        .filter(cond => Object.keys(cond).length > 0);
    return { AND: andConditions };
}
exports.buildFilters = buildFilters;
//# sourceMappingURL=filterFunction.js.map
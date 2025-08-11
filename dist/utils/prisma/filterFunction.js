"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.buildFilters = void 0;
function buildFilters(filters) {
    const andConditions = filters.map(({ field, value }) => {
        if (field.includes('.')) {
            const [relation, relField] = field.split('.');
            if (!isNaN(Number(value))) {
                return {
                    [relation]: {
                        [relField]: Number(value),
                    },
                };
            }
            return {
                [relation]: {
                    [relField]: {
                        contains: value
                    },
                },
            };
        }
        else {
            if (!isNaN(Number(value))) {
                return { [field]: Number(value) };
            }
            return {
                [field]: {
                    contains: value
                },
            };
        }
    }).filter(cond => Object.keys(cond).length > 0);
    return andConditions.length > 0 ? { AND: andConditions } : {};
}
exports.buildFilters = buildFilters;
//# sourceMappingURL=filterFunction.js.map
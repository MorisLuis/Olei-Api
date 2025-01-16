"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.simpleSearchQuerySchema = void 0;
const zod_1 = require("zod");
const simpleSearchQuerySchema = zod_1.z.object({
    searchTerm: zod_1.z
        .string()
        .transform((val) => (val === undefined ? "" : val)),
});
exports.simpleSearchQuerySchema = simpleSearchQuerySchema;
//# sourceMappingURL=searchValidations.js.map
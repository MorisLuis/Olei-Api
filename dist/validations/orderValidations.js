"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getTotalOrderDetailsQuerrySchema = exports.getOrderDetailsQuerrySchema = void 0;
const zod_1 = require("zod");
// getSells
exports.getOrderDetailsQuerrySchema = zod_1.z.object({
    folio: zod_1.z.string().nonempty(),
    PageNumber: zod_1.z.
        preprocess((val) => (typeof val === "string" ? parseInt(val, 10) : val), zod_1.z.number()),
});
exports.getTotalOrderDetailsQuerrySchema = zod_1.z.object({
    folio: zod_1.z.string().nonempty()
});
//# sourceMappingURL=orderValidations.js.map
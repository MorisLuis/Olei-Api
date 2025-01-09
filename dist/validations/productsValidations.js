"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getProductsByStockQuerySchema = void 0;
const zod_1 = require("zod");
exports.getProductsByStockQuerySchema = zod_1.z.object({
    PageNumber: zod_1.z.
        preprocess((val) => (typeof val === "string" ? parseInt(val, 10) : val), zod_1.z.number()),
    PageSize: zod_1.z.
        preprocess((val) => (typeof val === "string" ? parseInt(val, 10) : val), zod_1.z.number()),
});
//# sourceMappingURL=productsValidations.js.map
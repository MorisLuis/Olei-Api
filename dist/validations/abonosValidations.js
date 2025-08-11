"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getAbonosQuerySchema = void 0;
const zod_1 = require("zod");
exports.getAbonosQuerySchema = zod_1.z.object({
    PageNumber: zod_1.z
        .preprocess((val) => (typeof val === "string" ? parseInt(val, 10) : val), zod_1.z.number())
        .refine((val) => val > 0 && val < 100, { message: "PageNumber debe ser un número positivo mayor que 0 y menor que 100" }),
    limit: zod_1.z
        .preprocess((val) => (typeof val === "string" ? parseInt(val, 10) : val), zod_1.z.number())
        .refine((val) => val > 0 && val < 100, { message: "limit debe ser un número positivo mayor que 0 y menor que 100" }),
    orderField: zod_1.z
        .enum(["Folio", "Fecha"])
        .optional()
        .default("Folio"),
    orderDirection: zod_1.z.enum(["asc", "desc"]).optional().default("asc")
});
//# sourceMappingURL=abonosValidations.js.map
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getSellsProductsCountAndTotalQuerySchema = exports.getSellsProductsQuerySchema = void 0;
const zod_1 = require("zod");
const sells_1 = require("../interface/sells");
// getSellsProducts
const getSellsProductsQuerySchema = zod_1.z.object({
    Marca: zod_1.z.preprocess((val) => val === undefined || val === null ? null : val, zod_1.z.string().nullable()),
    Codigo: zod_1.z.preprocess((val) => val === undefined || val === null ? null : val, zod_1.z.string().nullable()),
    Descripcion: zod_1.z.preprocess((val) => val === undefined || val === null ? null : val, zod_1.z.string().nullable()),
    Sku: zod_1.z.preprocess((val) => val === undefined || val === null ? null : val, zod_1.z.string().nullable()),
    DateEnd: zod_1.z.preprocess((val) => (val === "undefined" ? undefined : val), zod_1.z.string().optional()),
    DateExactly: zod_1.z.preprocess((val) => (val === "undefined" ? undefined : val), zod_1.z.string().optional()),
    DateStart: zod_1.z.preprocess((val) => (val === "undefined" ? undefined : val), zod_1.z.string().optional()),
    PageNumber: zod_1.z.
        preprocess((val) => (typeof val === "string" ? parseInt(val, 10) : val), zod_1.z.number()),
    OrderCondition: zod_1.z
        .string()
        .optional()
        .refine((val) => val === undefined || sells_1.SellsProductsOrderCondition.includes(val), { message: "OrderCondition debe ser 'Folio', 'Codigo', 'Fecha' o 'Marca'" }),
});
exports.getSellsProductsQuerySchema = getSellsProductsQuerySchema;
const getSellsProductsCountAndTotalQuerySchema = zod_1.z.object({
    Marca: zod_1.z.preprocess((val) => val === undefined || val === null ? null : val, zod_1.z.string().nullable()),
    Codigo: zod_1.z.preprocess((val) => val === undefined || val === null ? null : val, zod_1.z.string().nullable()),
    Descripcion: zod_1.z.preprocess((val) => val === undefined || val === null ? null : val, zod_1.z.string().nullable()),
    Sku: zod_1.z.preprocess((val) => val === undefined || val === null ? null : val, zod_1.z.string().nullable()),
    DateEnd: zod_1.z.preprocess((val) => (val === "undefined" ? undefined : val), zod_1.z.string().optional()),
    DateExactly: zod_1.z.preprocess((val) => (val === "undefined" ? undefined : val), zod_1.z.string().optional()),
    DateStart: zod_1.z.preprocess((val) => (val === "undefined" ? undefined : val), zod_1.z.string().optional())
});
exports.getSellsProductsCountAndTotalQuerySchema = getSellsProductsCountAndTotalQuerySchema;
//# sourceMappingURL=sellsProductsValidations.js.map
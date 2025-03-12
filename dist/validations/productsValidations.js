"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getProductByStockAndCodeBarSchema = exports.getProductsByStockQuerySchema = exports.serachProductQuerySchema = exports.getTotalProductsQuerySchema = exports.getProducByIdWebQuerySchema = exports.getProductsQuerySchema = void 0;
const zod_1 = require("zod");
exports.getProductsQuerySchema = zod_1.z.object({
    page: zod_1.z.
        preprocess((val) => (typeof val === "string" ? parseInt(val, 10) : val), zod_1.z.number()),
    limit: zod_1.z.
        preprocess((val) => (typeof val === "string" ? parseInt(val, 10) : val), zod_1.z.number()),
    nombre: zod_1.z
        .string()
        .transform((val) => (val === undefined ? "" : val)),
    marca: zod_1.z
        .string()
        .transform((val) => (val === undefined ? "" : val)),
    familia: zod_1.z
        .string()
        .transform((val) => (val === undefined ? "" : val)),
    folio: zod_1.z
        .string()
        .transform((val) => (val === undefined ? "" : val))
});
exports.getProducByIdWebQuerySchema = zod_1.z.object({
    Marca: zod_1.z
        .string()
        .transform((val) => (val === undefined ? "" : val)),
});
exports.getTotalProductsQuerySchema = zod_1.z.object({
    nombre: zod_1.z
        .string()
        .optional()
        .transform((val) => (val === undefined ? "" : val)),
    marca: zod_1.z
        .string()
        .optional()
        .transform((val) => (val === undefined ? "" : val)),
    familia: zod_1.z
        .string()
        .optional()
        .transform((val) => (val === undefined ? "" : val)),
    folio: zod_1.z
        .string()
        .optional()
        .transform((val) => (val === undefined ? "" : val))
});
exports.serachProductQuerySchema = zod_1.z.object({
    nombre: zod_1.z
        .string()
        .optional()
        .transform((val) => (val === undefined ? "" : val)),
    marca: zod_1.z
        .string()
        .optional()
        .transform((val) => (val === undefined ? "" : val)),
    familia: zod_1.z
        .string()
        .optional()
        .transform((val) => (val === undefined ? "" : val)),
    codigo: zod_1.z
        .string()
        .optional()
        .transform((val) => (val === undefined ? "" : val))
});
// App
exports.getProductsByStockQuerySchema = zod_1.z.object({
    PageNumber: zod_1.z.
        preprocess((val) => (typeof val === "string" ? parseInt(val, 10) : val), zod_1.z.number()),
    PageSize: zod_1.z.
        preprocess((val) => (typeof val === "string" ? parseInt(val, 10) : val), zod_1.z.number()),
});
exports.getProductByStockAndCodeBarSchema = zod_1.z.object({
    CodBar: zod_1.z.string().default(""),
    Codigo: zod_1.z.string().default(""),
    SKU: zod_1.z.string().default("")
});
//# sourceMappingURL=productsValidations.js.map
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.searchClientQuerySchema = exports.selectClientBodySchema = exports.getClientIdQuerySchema = exports.getClientsTotalQuerySchema = exports.getClientsQuerySchema = void 0;
const zod_1 = require("zod");
exports.getClientsQuerySchema = zod_1.z.object({
    PageNumber: zod_1.z
        .preprocess((val) => (typeof val === "string" ? parseInt(val, 10) : val), zod_1.z.number())
        .refine((val) => val > 0 && val < 100, { message: "PageNumber debe ser un número positivo mayor que 0 y menor que 100" }),
    limit: zod_1.z
        .preprocess((val) => (typeof val === "string" ? parseInt(val, 10) : val), zod_1.z.number())
        .refine((val) => val > 0 && val < 100, {
        message: "limit debe ser un número positivo mayor que 0 y menor que 100",
    }),
    orderField: zod_1.z.enum(['Nombre']).optional().default("Nombre"),
    Nombre: zod_1.z.string().optional(),
    orderDirection: zod_1.z.enum(['asc', 'desc']).optional().default("asc"),
    Id_Cliente: zod_1.z.string().optional()
});
exports.getClientsTotalQuerySchema = zod_1.z.object({
    searchTerm: zod_1.z.preprocess((val) => (val === undefined ? '' : val), zod_1.z.string())
});
exports.getClientIdQuerySchema = zod_1.z.object({
    Id_Almacen: zod_1.z
        .preprocess((val) => (typeof val === "string" ? parseInt(val, 10) : val), zod_1.z.number()),
    Id_Cliente: zod_1.z
        .preprocess((val) => (typeof val === "string" ? parseInt(val, 10) : val), zod_1.z.number()),
});
exports.selectClientBodySchema = zod_1.z.object({
    Id_Almacen: zod_1.z
        .preprocess((val) => (typeof val === "string" ? parseInt(val, 10) : val), zod_1.z.number()),
    Id_Cliente: zod_1.z
        .preprocess((val) => (typeof val === "string" ? parseInt(val, 10) : val), zod_1.z.number()),
    Id_ListPre: zod_1.z
        .preprocess((val) => (typeof val === "string" ? parseInt(val, 10) : val), zod_1.z.number()),
});
exports.searchClientQuerySchema = zod_1.z.object({
    term: zod_1.z.string()
});
//# sourceMappingURL=client.schema.js.map
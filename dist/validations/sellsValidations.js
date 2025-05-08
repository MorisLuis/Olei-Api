"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getClientParamsSchema = exports.getFolioParamsSchema = exports.getSellByIdQuerySchema = exports.getSellsByClientCountAndTotalQuerySchema = exports.getSellsByClientQuerySchema = exports.getSellsCountAndTotalQuerySchema = exports.getSellsQuerySchema = void 0;
const zod_1 = require("zod");
const sells_1 = require("../interface/sells");
// QUERY'S
exports.getSellsQuerySchema = zod_1.z.object({
    PageNumber: zod_1.z.
        preprocess((val) => (typeof val === "string" ? parseInt(val, 10) : val), zod_1.z.number()),
    sellsOrderCondition: zod_1.z
        .string()
        .optional()
        .refine((val) => val === undefined || sells_1.SellsOrderCondition.includes(val), { message: "sellsOrderCondition debe ser 'Nombre', 'Total'" }),
    searchTerm: zod_1.z.preprocess((val) => (val === undefined ? '' : val), zod_1.z.string())
});
exports.getSellsCountAndTotalQuerySchema = zod_1.z.object({
    searchTerm: zod_1.z.preprocess((val) => (val === undefined ? '' : val), zod_1.z.string())
});
exports.getSellsByClientQuerySchema = zod_1.z.object({
    PageNumber: zod_1.z.
        preprocess((val) => (typeof val === "string" ? parseInt(val, 10) : val), zod_1.z.number()),
    sellsOrderCondition: zod_1.z
        .string()
        .refine((val) => val === undefined || sells_1.SellsOrderByClientCondition.includes(val), { message: "sellsOrderCondition debe ser 'TipoDoc', 'Folio', 'Fecha', 'FechaEntrega' o 'ExpiredDays'" }),
    FilterExpired: zod_1.z.string().optional().transform((val) => (val ? Number(val) === 1 ? 1 : 0 : 0)),
    FilterNotExpired: zod_1.z.string().optional().transform((val) => (val ? Number(val) === 1 ? 1 : 0 : 0)),
    TipoDoc: zod_1.z
        .string()
        .optional()
        .transform((val) => (val ? parseInt(val, 10) : 0)) // Convierte a número
        .refine((val) => sells_1.TipoDoc.includes(val), { message: "TipoDoc debe ser 0, 1 o 2" }),
    DateEnd: zod_1.z.preprocess((val) => (val === "undefined" ? undefined : val), zod_1.z.string().optional()),
    DateExactly: zod_1.z.preprocess((val) => (val === "undefined" ? undefined : val), zod_1.z.string().optional()),
    DateStart: zod_1.z.preprocess((val) => (val === "undefined" ? undefined : val), zod_1.z.string().optional())
});
exports.getSellsByClientCountAndTotalQuerySchema = zod_1.z.object({
    FilterExpired: zod_1.z.string().optional().transform((val) => (val ? Number(val) === 1 ? 1 : 0 : 0)),
    FilterNotExpired: zod_1.z.string().optional().transform((val) => (val ? Number(val) === 1 ? 1 : 0 : 0)),
    TipoDoc: zod_1.z
        .string()
        .optional()
        .transform((val) => (val ? parseInt(val, 10) : 0)) // Convierte a número
        .refine((val) => sells_1.TipoDoc.includes(val), { message: "TipoDoc debe ser 0, 1 o 2" }),
    DateEnd: zod_1.z.preprocess((val) => (val === "undefined" ? undefined : val), zod_1.z.string().optional()),
    DateExactly: zod_1.z.preprocess((val) => (val === "undefined" ? undefined : val), zod_1.z.string().optional()),
    DateStart: zod_1.z.preprocess((val) => (val === "undefined" ? undefined : val), zod_1.z.string().optional())
});
exports.getSellByIdQuerySchema = zod_1.z.object({
    Serie: zod_1.z
        .string()
        .transform((val) => (val === undefined ? "" : val)), // Transforma undefined a cadena vacía
    Id_Almacen: zod_1.z
        .preprocess((val) => (typeof val === "string" ? parseInt(val, 10) : val), zod_1.z.number()),
    TipoDoc: zod_1.z
        .string()
        .optional()
        .transform((val) => (val ? parseInt(val, 10) : 0)) // Convierte a número
        .refine((val) => sells_1.TipoDoc.includes(val), { message: "TipoDoc debe ser 0, 1 o 2" })
});
// PARAMS
exports.getFolioParamsSchema = zod_1.z.object({
    folio: zod_1.z.string().nonempty()
});
exports.getClientParamsSchema = zod_1.z.object({
    client: zod_1.z.string().nonempty().transform((val) => (val ? parseInt(val, 10) : 0))
});
//# sourceMappingURL=sellsValidations.js.map
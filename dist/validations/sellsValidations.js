"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getClientParamsSchema = exports.getTotalSellsByClientQuerySchema = exports.getTotalCobranzaQuerySchema = exports.getCobranzaByClientQuerySchema = exports.getCobranzaQuerySchema = exports.getSellsByClientQuerySchema = exports.getSellByIdParamsSchema = exports.getSellByIdQuerySchema = exports.getTotalSellsQuerySchema = exports.getSellsQuerySchema = void 0;
const zod_1 = require("zod");
const sells_1 = require("../interface/sells");
// getSells
exports.getSellsQuerySchema = zod_1.z.object({
    PageNumber: zod_1.z.
        preprocess((val) => (typeof val === "string" ? parseInt(val, 10) : val), zod_1.z.number()),
    sellsOrderCondition: zod_1.z
        .string()
        .optional()
        .refine((val) => val === undefined || sells_1.SellsOrderCondition.includes(val), { message: "sellsOrderCondition debe ser 'Cliente', 'Fecha', 'TipoContacto'" }),
    searchTerm: zod_1.z.preprocess((val) => (val === undefined ? '' : val), zod_1.z.string())
});
exports.getTotalSellsQuerySchema = zod_1.z.object({
    searchTerm: zod_1.z.preprocess((val) => (val === undefined ? '' : val), zod_1.z.string())
});
// getSellById
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
        .refine((val) => sells_1.TipoDoc.includes(val), { message: "TipoDoc debe ser 0, 1 o 2" }),
});
exports.getSellByIdParamsSchema = zod_1.z.object({
    folio: zod_1.z.string().nonempty()
});
// getSellsByClient
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
// getCobranza
exports.getCobranzaQuerySchema = zod_1.z.object({
    PageNumber: zod_1.z.
        preprocess((val) => (typeof val === "string" ? parseInt(val, 10) : val), zod_1.z.number()),
    cobranzaOrderCondition: zod_1.z
        .string()
        .optional()
        .refine((val) => val === undefined || sells_1.CobranzaOrderCondition.includes(val), { message: "cobranzaOrderCondition debe ser 'Nombre', 'ExpiredDays', 'SaldoVencido', 'SaldoNoVencido', 'TotalSaldo'" }),
    termSearch: zod_1.z.string().optional().transform(val => val ?? '')
});
exports.getCobranzaByClientQuerySchema = zod_1.z.object({
    PageNumber: zod_1.z.
        preprocess((val) => (typeof val === "string" ? parseInt(val, 10) : val), zod_1.z.number()),
    cobranzaOrderCondition: zod_1.z
        .string()
        .optional()
        .refine((val) => val === undefined || sells_1.SellsOrderByClientCondition.includes(val), { message: "cobranzaOrderCondition debe ser 'TipoDoc', 'Folio', 'Fecha', 'FechaEntrega' o 'ExpiredDays'" }),
    TipoDoc: zod_1.z
        .string()
        .optional()
        .transform((val) => (val ? parseInt(val, 10) : 0)) // Convierte a número
        .refine((val) => sells_1.TipoDoc.includes(val), { message: "TipoDoc debe ser 0, 1 o 2" }),
    FilterExpired: zod_1.z.string().optional().transform((val) => (val ? Number(val) === 1 ? 1 : 0 : 0)),
    FilterNotExpired: zod_1.z.string().optional().transform((val) => (val ? Number(val) === 1 ? 1 : 0 : 0)),
    DateEnd: zod_1.z.preprocess((val) => (val === "undefined" ? undefined : val), zod_1.z.string().optional()),
    DateExactly: zod_1.z.preprocess((val) => (val === "undefined" ? undefined : val), zod_1.z.string().optional()),
    DateStart: zod_1.z.preprocess((val) => (val === "undefined" ? undefined : val), zod_1.z.string().optional())
});
exports.getTotalCobranzaQuerySchema = zod_1.z.object({
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
// getTotalSellsByClient
exports.getTotalSellsByClientQuerySchema = zod_1.z.object({
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
exports.getClientParamsSchema = zod_1.z.object({
    client: zod_1.z.string().nonempty().transform((val) => (val ? parseInt(val, 10) : 0))
});
//# sourceMappingURL=sellsValidations.js.map
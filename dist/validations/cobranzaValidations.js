"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getTotalCobranzaQuerySchema = exports.getCobranzaByClientCountAndTotalQuerySchema = exports.getCobranzaByClientQuerySchema = exports.getCobranzaQuerySchema = exports.getCobranzaQueryCountAndTotalSchema = void 0;
const zod_1 = require("zod");
const sells_1 = require("../interface/sells");
// getCobranza
exports.getCobranzaQueryCountAndTotalSchema = zod_1.z.object({
    termSearch: zod_1.z.string().optional().transform(val => val ?? '')
});
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
    DateStart: zod_1.z.preprocess((val) => (val === "undefined" ? undefined : val), zod_1.z.string().optional()),
    Id_Almacen: zod_1.z.string().nonempty().transform((val) => (val ? parseInt(val, 10) : 0))
});
exports.getCobranzaByClientCountAndTotalQuerySchema = zod_1.z.object({
    TipoDoc: zod_1.z
        .string()
        .optional()
        .transform((val) => (val ? parseInt(val, 10) : 0)) // Convierte a número
        .refine((val) => sells_1.TipoDoc.includes(val), { message: "TipoDoc debe ser 0, 1 o 2" }),
    FilterExpired: zod_1.z.string().optional().transform((val) => (val ? Number(val) === 1 ? 1 : 0 : 0)),
    FilterNotExpired: zod_1.z.string().optional().transform((val) => (val ? Number(val) === 1 ? 1 : 0 : 0)),
    DateEnd: zod_1.z.preprocess((val) => (val === "undefined" ? undefined : val), zod_1.z.string().optional()),
    DateExactly: zod_1.z.preprocess((val) => (val === "undefined" ? undefined : val), zod_1.z.string().optional()),
    DateStart: zod_1.z.preprocess((val) => (val === "undefined" ? undefined : val), zod_1.z.string().optional()),
    Id_Almacen: zod_1.z.string().nonempty().transform((val) => (val ? parseInt(val, 10) : 0))
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
//# sourceMappingURL=cobranzaValidations.js.map
import { z } from "zod";
import type { CobranzaOrderConditionType, SellsInterface, SellsOrderConditionByClientType, typeTipoDoc } from "../interface/sells";
import { CobranzaOrderCondition, SellsOrderByClientCondition, TipoDoc } from "../interface/sells";


// getCobranza
export const getCobranzaQueryCountAndTotalSchema = z.object({
    termSearch: z.string().optional().transform(val => val ?? ''),
    startDate: z.string().optional(),
    endDate: z.string().optional(),
    exactlyDate: z.string().optional()
});

export const getCobranzaQuerySchema = z.object({
    PageNumber: z.
        preprocess((val) => (typeof val === "string" ? parseInt(val, 10) : val), z.number()),
    cobranzaOrderCondition: z
        .string()
        .optional()
        .refine(
            (val): val is CobranzaOrderConditionType =>
                val === undefined || CobranzaOrderCondition.includes(val as CobranzaOrderConditionType),
            { message: "cobranzaOrderCondition debe ser 'Nombre', 'ExpiredDays', 'SaldoVencido', 'SaldoNoVencido', 'TotalSaldo'" }
        ),
    termSearch: z.string().optional().transform(val => val ?? '')
});


export const getCobranzaByClientQuerySchema = z.object({
    PageNumber: z.
        preprocess((val) => (typeof val === "string" ? parseInt(val, 10) : val), z.number()),
    cobranzaOrderCondition: z
        .string()
        .optional()
        .refine(
            (val): val is SellsOrderConditionByClientType =>
                val === undefined || SellsOrderByClientCondition.includes(val as SellsOrderConditionByClientType),
            { message: "cobranzaOrderCondition debe ser 'TipoDoc', 'Folio', 'Fecha', 'FechaEntrega' o 'ExpiredDays'" }
        ),
    TipoDoc: z
        .string()
        .optional()
        .transform((val) => (val ? parseInt(val, 10) : 0)) // Convierte a número
        .refine(
            (val): val is SellsInterface["TipoDoc"] => TipoDoc.includes(val as typeTipoDoc),
            { message: "TipoDoc debe ser 0, 1 o 2" }
        ),
    FilterExpired: z.string().optional().transform((val) => (val ? Number(val) === 1 ? 1 : 0 : 0)),
    FilterNotExpired: z.string().optional().transform((val) => (val ? Number(val) === 1 ? 1 : 0 : 0)),
    DateEnd: z.preprocess(
        (val) => (val === "undefined" ? undefined : val),
        z.string().optional()
    ),
    DateExactly: z.preprocess(
        (val) => (val === "undefined" ? undefined : val),
        z.string().optional()
    ),
    DateStart: z.preprocess(
        (val) => (val === "undefined" ? undefined : val),
        z.string().optional()
    ),
    Id_Almacen: z.string().nonempty().transform((val) => (val ? parseInt(val, 10) : 0))
})

export const getCobranzaByClientCountAndTotalQuerySchema = z.object({
    TipoDoc: z
        .string()
        .optional()
        .transform((val) => (val ? parseInt(val, 10) : 0)) // Convierte a número
        .refine(
            (val): val is SellsInterface["TipoDoc"] => TipoDoc.includes(val as typeTipoDoc),
            { message: "TipoDoc debe ser 0, 1 o 2" }
        ),
    FilterExpired: z.string().optional().transform((val) => (val ? Number(val) === 1 ? 1 : 0 : 0)),
    FilterNotExpired: z.string().optional().transform((val) => (val ? Number(val) === 1 ? 1 : 0 : 0)),
    DateEnd: z.preprocess(
        (val) => (val === "undefined" ? undefined : val),
        z.string().optional()
    ),
    DateExactly: z.preprocess(
        (val) => (val === "undefined" ? undefined : val),
        z.string().optional()
    ),
    DateStart: z.preprocess(
        (val) => (val === "undefined" ? undefined : val),
        z.string().optional()
    ),
    Id_Almacen: z.string().nonempty().transform((val) => (val ? parseInt(val, 10) : 0))
})

export const getTotalCobranzaQuerySchema = z.object({
    FilterExpired: z.string().optional().transform((val) => (val ? Number(val) === 1 ? 1 : 0 : 0)),
    FilterNotExpired: z.string().optional().transform((val) => (val ? Number(val) === 1 ? 1 : 0 : 0)),
    TipoDoc: z
        .string()
        .optional()
        .transform((val) => (val ? parseInt(val, 10) : 0)) // Convierte a número
        .refine(
            (val): val is SellsInterface["TipoDoc"] => TipoDoc.includes(val as typeTipoDoc),
            { message: "TipoDoc debe ser 0, 1 o 2" }
        ),
    DateEnd: z.preprocess(
        (val) => (val === "undefined" ? undefined : val),
        z.string().optional()
    ),
    DateExactly: z.preprocess(
        (val) => (val === "undefined" ? undefined : val),
        z.string().optional()
    ),
    DateStart: z.preprocess(
        (val) => (val === "undefined" ? undefined : val),
        z.string().optional()
    )
})
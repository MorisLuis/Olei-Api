import { z } from "zod";
import type { CobranzaOrderConditionType, SellsInterface, SellsOrderConditionByClientType, SellsOrderConditionType, typeTipoDoc } from '../interface/sells';
import { CobranzaOrderCondition, SellsOrderByClientCondition, SellsOrderCondition, TipoDoc } from '../interface/sells';

// getSells
export const getSellsQuerySchema = z.object({
    PageNumber: z.
        preprocess((val) => (typeof val === "string" ? parseInt(val, 10) : val), z.number()),
    sellsOrderCondition: z
        .string()
        .optional()
        .refine(
            (val): val is SellsOrderConditionType =>
                val === undefined || SellsOrderCondition.includes(val as SellsOrderConditionType),
            { message: "sellsOrderCondition debe ser 'Cliente', 'Fecha', 'TipoContacto'" }
        )
})

// getSellById
export const getSellByIdQuerySchema = z.object({
    Serie: z
        .string()
        .transform((val) => (val === undefined ? "" : val)), // Transforma undefined a cadena vacía
    Id_Almacen: z
        .preprocess((val) => (typeof val === "string" ? parseInt(val, 10) : val), z.number()),
    TipoDoc: z
        .string()
        .optional()
        .transform((val) => (val ? parseInt(val, 10) : 0)) // Convierte a número
        .refine(
            (val): val is SellsInterface["TipoDoc"] => TipoDoc.includes(val as typeTipoDoc),
            { message: "TipoDoc debe ser 0, 1 o 2" }
        ),
});


export const getSellByIdParamsSchema = z.object({
    folio: z.string().nonempty()
});

// getSellsByClient
export const getSellsByClientQuerySchema = z.object({
    PageNumber: z.
        preprocess((val) => (typeof val === "string" ? parseInt(val, 10) : val), z.number()),
    sellsOrderCondition: z
        .string()
        .refine(
            (val): val is SellsOrderConditionByClientType =>
                val === undefined || SellsOrderByClientCondition.includes(val as SellsOrderConditionByClientType),
            { message: "sellsOrderCondition debe ser 'TipoDoc', 'Folio', 'Fecha', 'FechaEntrega' o 'ExpiredDays'" }
        ),
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

// getCobranza
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
        )
});


export const getCobranzaByClientQuerySchema = z.object({
    Id_Almacen: z.string().nonempty().transform((val) => (val ? parseInt(val, 10) : 0)),
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
    )
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

// getTotalSellsByClient
export const getTotalSellsByClientQuerySchema = z.object({
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
});

export const getClientParamsSchema = z.object({
    client: z.string().nonempty().transform((val) => (val ? parseInt(val, 10) : 0))
});
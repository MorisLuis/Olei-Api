import { z } from "zod";
import type { SellsInterface, SellsOrderConditionByClientType, SellsOrderConditionType, typeTipoDoc } from '../interface/sells';
import { SellsOrderByClientCondition, SellsOrderCondition, TipoDoc } from '../interface/sells';

export const postSellSchema = z.object({
    UniqueKey: z.string().optional(),
    Total: z.number(),
    Subtotal: z.number(),
    Piezas: z.number().optional(),
});

export const postSellDetailsSchema = z.object({
    Codigo: z.string(),
    Id_Marca: z.number(),
    Cantidad: z.number(),
    Precio: z.number(),
    Descripcion: z.string().nullable().optional()
});

export const postSellBodySchema = z.object({
    Id_Cliente: z.number(),
    Id_Almacen: z.number(),
    sellsData: postSellSchema,
    sellsDetails: z.array(postSellDetailsSchema),
    TipoDoc: z.number().refine((val) => TipoDoc.includes(val as typeTipoDoc), {
        message: "TipoDoc debe ser 1, 2 o 3"
    }) 
});

// QUERY'S
export const getSellsQuerySchema = z.object({
    PageNumber: z.
        preprocess((val) => (typeof val === "string" ? parseInt(val, 10) : val), z.number()),
    sellsOrderCondition: z
        .string()
        .optional()
        .refine(
            (val): val is SellsOrderConditionType =>
                val === undefined || SellsOrderCondition.includes(val as SellsOrderConditionType),
            { message: "sellsOrderCondition debe ser 'Nombre', 'Total'" }
        ),
    searchTerm: z.preprocess((val) => (val === undefined ? '' : val), z.string()),
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

export const getSellsCountAndTotalQuerySchema = z.object({
    searchTerm: z.preprocess((val) => (val === undefined ? '' : val), z.string()),
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


export const getSellsByClientCountAndTotalQuerySchema = z.object({

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
        )
});


// PARAMS
export const getFolioParamsSchema = z.object({
    folio: z.string().nonempty()
});


export const getClientParamsSchema = z.object({
    client: z.string().nonempty().transform((val) => (val ? parseInt(val, 10) : 0))
});
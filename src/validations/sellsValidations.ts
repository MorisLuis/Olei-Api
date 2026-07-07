import { z } from "zod";
import type { SellsOrderConditionByClientType, SellsOrderConditionType } from '../interface/sells';
import { SellsOrderByClientCondition, SellsOrderCondition, TipoDoc, type typeTipoDoc } from '../interface/sells';
import { booleanNumberFilterSchema, pageNumberSchema } from "./shared";

const tipoDocSchema = z
    .string()
    .optional()
    .transform((val) => (val ? parseInt(val, 10) : 0))
    .refine(
        (val): val is typeTipoDoc | 0 =>
            val === 0 || TipoDoc.includes(val as typeTipoDoc),
        { message: "TipoDoc debe ser 0, 2, 3 o 4" }
    );

const optionalDateStringSchema = z.preprocess(
    (val) => (val === "undefined" ? undefined : val),
    z.string().optional()
);

const sellsOrderConditionSchema = z
    .string()
    .optional()
    .refine(
        (val): val is SellsOrderConditionType =>
            val === undefined || SellsOrderCondition.includes(val as SellsOrderConditionType),
        { message: "sellsOrderCondition debe ser 'Nombre' o 'Total'" }
    );

const sellsOrderByClientConditionSchema = z
    .string()
    .optional()
    .refine(
        (val): val is SellsOrderConditionByClientType =>
            val === undefined || SellsOrderByClientCondition.includes(val as SellsOrderConditionByClientType),
        { message: "sellsOrderCondition debe ser 'TipoDoc', 'Folio', 'Fecha', 'FechaEntrega' o 'ExpiredDays'" }
    );

const sellsBaseQuerySchema = z.object({
    searchTerm: z.preprocess((val) => (val === undefined ? '' : val), z.string()),
    DateEnd: optionalDateStringSchema,
    DateExactly: optionalDateStringSchema,
    DateStart: optionalDateStringSchema
});

const sellsByClientBaseQuerySchema = z.object({
    FilterExpired: booleanNumberFilterSchema,
    FilterNotExpired: booleanNumberFilterSchema,
    TipoDoc: tipoDocSchema,
    DateEnd: optionalDateStringSchema,
    DateExactly: optionalDateStringSchema,
    DateStart: optionalDateStringSchema
});


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
        message: "TipoDoc debe ser 2, 3 o 4"
    })
});

// QUERY'S
export const getSellsQuerySchema = sellsBaseQuerySchema.extend({
    PageNumber: pageNumberSchema,
    sellsOrderCondition: sellsOrderConditionSchema
});

export const getSellsCountAndTotalQuerySchema = sellsBaseQuerySchema;

export const getSellsByClientQuerySchema = sellsByClientBaseQuerySchema.extend({
    PageNumber: pageNumberSchema,
    sellsOrderCondition: sellsOrderByClientConditionSchema
})

export const getSellsByClientCountAndTotalQuerySchema = sellsByClientBaseQuerySchema

export const getSellByIdQuerySchema = z.object({
    Serie: z
        .string()
        .transform((val) => (val === undefined ? "" : val)), // Transforma undefined a cadena vacía
    Id_Almacen: z
        .preprocess((val) => (typeof val === "string" ? parseInt(val, 10) : val), z.number()),
    TipoDoc: tipoDocSchema
});


// PARAMS
export const getFolioParamsSchema = z.object({
    folio: z.string().nonempty()
});


export const getClientParamsSchema = z.object({
    client: z.string().nonempty().transform((val) => (val ? parseInt(val, 10) : 0))
});
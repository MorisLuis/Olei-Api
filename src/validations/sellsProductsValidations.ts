import { z } from "zod";
import type { SellsProductsOrderConditionType } from "../interface/sells";
import { SellsProductsOrderCondition } from "../interface/sells";


// getSellsProducts
const getSellsProductsQuerySchema = z.object({
    Marca: z.preprocess(
        (val) => val === undefined || val === null ? null : val,
        z.string().nullable()
    ),

    Codigo: z.preprocess(
        (val) => val === undefined || val === null ? null : val,
        z.string().nullable()
    ),

    Descripcion: z.preprocess(
        (val) => val === undefined || val === null ? null : val,
        z.string().nullable()
    ),

    Sku: z.preprocess(
        (val) => val === undefined || val === null ? null : val,
        z.string().nullable()
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
    ),

    PageNumber: z.
        preprocess((val) => (typeof val === "string" ? parseInt(val, 10) : val), z.number()),

    OrderCondition: z
        .string()
        .optional()
        .refine(
            (val): val is SellsProductsOrderConditionType =>
                val === undefined || SellsProductsOrderCondition.includes(val as SellsProductsOrderConditionType),
            { message: "OrderCondition debe ser 'Folio', 'Codigo', 'Fecha' o 'Marca'" }
        ),
});

const getSellsProductsCountAndTotalQuerySchema = z.object({
    Marca: z.preprocess(
        (val) => val === undefined || val === null ? null : val,
        z.string().nullable()
    ),

    Codigo: z.preprocess(
        (val) => val === undefined || val === null ? null : val,
        z.string().nullable()
    ),

    Descripcion: z.preprocess(
        (val) => val === undefined || val === null ? null : val,
        z.string().nullable()
    ),

    Sku: z.preprocess(
        (val) => val === undefined || val === null ? null : val,
        z.string().nullable()
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


export {
    getSellsProductsQuerySchema,
    getSellsProductsCountAndTotalQuerySchema
}
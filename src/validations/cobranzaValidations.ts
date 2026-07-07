import { z } from "zod";
import type { CobranzaOrderConditionType, SellsInterface } from "../interface/sells";
import { CobranzaOrderCondition } from "../interface/sells";
import { booleanNumberFilterSchema, pageNumberSchema } from "./shared";

//FIXME: Unify the TipoDocs constants
export type typeTipoDoc =   1 | 2 | 3;
export const TipoDoc: typeTipoDoc[] = [1, 2, 3];

const idAlmacenSchema = z
    .string()
    .nonempty()
    .transform((val) => parseInt(val, 10));

const tipoDocSchema = z
    .string()
    .optional()
    .transform((val) => (val ? parseInt(val, 10) : 0))
    .refine(
        (val): val is SellsInterface["TipoDoc"] =>
            TipoDoc.includes(val as typeTipoDoc),
        { message: "TipoDoc debe ser 0, 1 o 2" }
    );

const optionalDateStringSchema = z.preprocess(
    (val) => (val === "undefined" ? undefined : val),
    z.string().optional()
);

const cobranzaOrderConditionSchema = z
    .string()
    .optional()
    .refine(
        (val): val is CobranzaOrderConditionType =>
            val === undefined || CobranzaOrderCondition.includes(val as CobranzaOrderConditionType),
        { message: "cobranzaOrderCondition debe ser 'Nombre', 'ExpiredDays', 'SaldoVencido', 'SaldoNoVencido', 'TotalSaldo'" }
    );

const cobranzaByClientBaseQuerySchema = z.object({
    Id_Almacen: idAlmacenSchema,
    TipoDoc: tipoDocSchema,
    FilterExpired: booleanNumberFilterSchema,
    FilterNotExpired: booleanNumberFilterSchema,
    DateEnd: optionalDateStringSchema,
    DateExactly: optionalDateStringSchema,
    DateStart: optionalDateStringSchema,
});


export const getCobranzaQueryCountAndTotalSchema = z.object({
    termSearch: z.string().optional().transform(val => val ?? ''),
    startDate: z.string().optional(),
    endDate: z.string().optional(),
    exactlyDate: z.string().optional()
});

export const getCobranzaQuerySchema = z.object({
    PageNumber: pageNumberSchema,
    cobranzaOrderCondition: cobranzaOrderConditionSchema,
    termSearch: z.string().optional().transform(val => val ?? '')
});

export const getCobranzaByClientQuerySchema =
    cobranzaByClientBaseQuerySchema.extend({
        PageNumber: pageNumberSchema,
        cobranzaOrderCondition: cobranzaOrderConditionSchema,
    });

export const getCobranzaByClientCountAndTotalQuerySchema = cobranzaByClientBaseQuerySchema;
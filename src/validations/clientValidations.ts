import { string, z } from "zod";
import type { ClientOrderConditionType } from "../interface/client";
import { ClientOrderCondition } from "../interface/client";


export const getClientsQuerySchema = z.object({
    PageNumber: z
        .preprocess((val) => (typeof val === "string" ? parseInt(val, 10) : val), z.number())
        .refine((val) => val > 0 && val < 100, { message: "PageNumber debe ser un número positivo mayor que 0 y menor que 100" }),

    clientOrderCondition: z
        .string()
        .optional()
        .refine(
            (val): val is ClientOrderConditionType =>
                val === undefined || ClientOrderCondition.includes(val as ClientOrderConditionType),
            { message: "sellsOrderCondition debe ser 'Nombre', 'Id_Cliente'" }
        ),
    searchTerm: z.preprocess((val) => (val === undefined ? '' : val), z.string()),
    searchId: z.preprocess((val) => (val === '' ? undefined : val), z.string().optional()),
    limit: z.preprocess((val) => (typeof val === "string" ? parseInt(val, 10) : val), z.number())


});

export const getClientsTotalQuerySchema = z.object({
    searchTerm: z.preprocess((val) => (val === undefined ? '' : val), z.string())
});



export const getClientIdQuerySchema = z.object({
    Id_Almacen: z
        .preprocess((val) => (typeof val === "string" ? parseInt(val, 10) : val), z.number()),
    Id_Cliente: z
        .preprocess((val) => (typeof val === "string" ? parseInt(val, 10) : val), z.number()),
})


export const selectClientBodySchema = z.object({
    Id_Almacen: z
        .preprocess((val) => (typeof val === "string" ? parseInt(val, 10) : val), z.number()),
    Id_Cliente: z
        .preprocess((val) => (typeof val === "string" ? parseInt(val, 10) : val), z.number()),
    Id_ListPre: z
        .preprocess((val) => (typeof val === "string" ? parseInt(val, 10) : val), z.number()),
})

export const searchClientQuerySchema = z.object({
    term: z.string()
})
import { z } from "zod";

export const getClientsQuerySchema = z.object({
    PageNumber: z
        .preprocess((val) => (typeof val === "string" ? parseInt(val, 10) : val), z.number())
        .refine((val) => val > 0 && val < 100, { message: "PageNumber debe ser un número positivo mayor que 0 y menor que 100" }),
    limit: z
        .preprocess((val) => (typeof val === "string" ? parseInt(val, 10) : val), z.number())
        .refine((val) => val > 0 && val < 100, {
            message: "limit debe ser un número positivo mayor que 0 y menor que 100",
        }),
    orderField: z.enum(['Nombre']).optional().default("Nombre"),
    Nombre: z.string().optional(),
    orderDirection: z.enum(['asc', 'desc']).optional().default("asc"),
    Id_Cliente: z.string().optional()   
})

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
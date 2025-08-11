import { z } from "zod";
import { filterField } from "./constants";
import type { FilterFieldType } from "./types";

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
    orderDirection: z.enum(["asc", "desc"]).optional().default("asc"),
    filterField: z.string().optional(),
    filterValue: z.string().optional()

}).superRefine((data, ctx) => {
    // Si uno existe, el otro debe existir
    if ((data.filterField && !data.filterValue) || (!data.filterField && data.filterValue)) {
        ctx.addIssue({
            code: z.ZodIssueCode.custom,
            message: "filterField and filterValue must be provided together",
            path: ["filterField", "filterValue"],
        });
        return;
    }

    if (data.filterField && data.filterValue) {
        // Separar arrays
        const fields = data.filterField.split(",").map((f) => f.trim());
        const values = data.filterValue.split(",").map((v) => v.trim());

        // Verificar que tengan igual longitud
        if (fields.length !== values.length) {
            ctx.addIssue({
                code: z.ZodIssueCode.custom,
                message: "filterField and filterValue must have the same number of items",
                path: ["filterField", "filterValue"],
            });
            return;
        }

        // Validar que cada field sea válido
        fields.forEach((field, i) => {
            if (!filterField.includes(field as FilterFieldType)) {
                ctx.addIssue({
                    code: z.ZodIssueCode.custom,
                    message: `filterField item '${field}' is not valid`,
                    path: ["filterField", i],
                });
            }
        });
    }
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
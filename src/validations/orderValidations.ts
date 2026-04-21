import { z } from "zod";

export const SellsSchema = z.object({
    UniqueKey: z.string().readonly().optional(),
    Total: z.number(),
    Subtotal: z.number(),
    Piezas: z.number().optional(),
});

export const SellsDetailsSchema = z.object({
    Codigo: z.string(),
    Id_Marca: z.number(),
    Cantidad: z.number(),
    Precio: z.number(),
    Descripcion: z.string().nullable().optional()
});

export const postOrderBodySchema = z.object({
    sellsData: SellsSchema,
    sellsDetails: z.array(SellsDetailsSchema)
});

// getOrder
export const getOrderParamsSchema = z.object({
    folio: z.string()
});

// getAllOrders
export const getAllOrdersParamsSchema = z.object({
    page: z
        .preprocess((val) => (typeof val === "string" ? parseInt(val, 10) : val), z.number())
        .refine((val) => val > 0, { message: "Page debe ser un número positivo mayor que 0" }),

    limit: z
        .preprocess((val) => (typeof val === "string" ? parseInt(val, 10) : val), z.number())
        .refine((val) => val > 0 && val < 100, { message: "limit debe ser un número positivo mayor que 0 y menor que 100" }),

});

// getSells
export const getOrderDetailsQuerrySchema = z.object({
    folio: z.string().nonempty(),
    TipoDoc: z.preprocess((val) => (typeof val === "string" ? parseInt(val, 10) : val), z.number()),
    PageNumber: z.
        preprocess((val) => (typeof val === "string" ? parseInt(val, 10) : val), z.number()),
})

export const getTotalOrderDetailsQuerrySchema = z.object({
    folio: z.string().nonempty(),
    TipoDoc: z.preprocess((val) => (typeof val === "string" ? parseInt(val, 10) : val), z.number()),
})
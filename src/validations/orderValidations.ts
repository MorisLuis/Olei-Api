import { z } from "zod";

// Validación para SellsInterface
export const SellsSchema = z.object({
    UniqueKey: z.string().optional(),
    Total: z.number(),
    Subtotal: z.number(),
    Piezas: z.number().optional(),
});

// Validación para SellsDetailsInterface
export const SellsDetailsSchema = z.object({
    Codigo: z.string(),
    Id_Marca: z.number(),
    Cantidad: z.number(),
    Precio: z.number(),
    Descripcion: z.string().nullable().optional()
});

// Validación para el cuerpo del request
export const postOrderBodySchema = z.object({
    sellsData: SellsSchema,
    sellsDetails: z.array(SellsDetailsSchema)
});

// getSells
export const getOrderDetailsQuerrySchema = z.object({
    folio: z.string().nonempty(),
    PageNumber: z.
        preprocess((val) => (typeof val === "string" ? parseInt(val, 10) : val), z.number()),
})

export const getTotalOrderDetailsQuerrySchema = z.object({
    folio: z.string().nonempty()
})
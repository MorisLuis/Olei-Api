import { z } from "zod";

const inventoryDetailsItemSchema = z.object({
    Codigo: z
        .string()
        .trim()
        .max(18, { message: "Codigo no puede exceder los 18 caracteres" }),
    Id_Marca: z
        .number()
        .int()
        .positive({ message: "Id_Marca debe ser un número entero positivo" }),
    Diferencia: z
        .number()
        .min(0, { message: "Diferencia debe ser un número mayor o igual a 0" }),
    SKU: z
        .string()
        .optional(),

    Cantidad: z
        .number()
        .positive()
});


export const postInventoryBodySchema = z.object({
    inventoryDetails: z.array(inventoryDetailsItemSchema),
    typeOfMovement: z.object({
        Accion: z
            .union([z.string(), z.number()])
            .transform((val) => (typeof val === "number" ? val.toString() : val)) // Convierte el número a string
            .refine(
                (val) => ["1", "2", "3"].includes(val), // Validación: debe ser "1", "2" o "3"
                { message: "Accion debe ser '1', '2' o '3'" }
            ),
        Id_TipoMovInv: z.number().int().nonnegative(),
        Id_AlmDest: z.number().int().nonnegative()
    })
});

export const getIdClienteQuerySchema = z.object({
    Id_Usuario: z
        .preprocess((val) => (typeof val === "string" ? parseInt(val, 10) : val), z.number())
});

export const getInventoryQuerySchema = z.object({
    Folio: z
        .number()
        .int()
})

export const searchProductInventoryQuerySchema = z.object({
    searchTerm: z.string(),
    Id_Almacen: z.string().nullable().default(null),

})
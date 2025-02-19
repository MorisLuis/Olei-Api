import { z } from "zod";

export const updateCodbarQuerySchema = z.object({
    codigo: z.string(),
    Id_Marca: z
        .union([z.string(), z.number()]) // Acepta string o number
        .transform((val) => Number(val)) // Convierte a número
        .refine((val) => Number.isInteger(val) && val >= 0, {
            message: "Id_Marca debe ser un número entero no negativo",
        }),
});

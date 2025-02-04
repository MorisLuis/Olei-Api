import { z } from "zod";


export const getAlmacenByIdQuerySchema = z.object({

    Id_Almacen: z
        .preprocess(
            (val) => (val === "undefined" ? undefined : val),
            z.string().optional()
        )
        .transform((val) => (val ? parseInt(val, 10) : 0)) // Convertimos a número
        .refine((val) => val >= 0, { message: "Id_Almacen debe ser un número positivo" }),
})

import { z } from "zod";
import { ClientOrderCondition, ClientOrderConditionType } from "../interface/client";


export const getClientsQuerySchema = z.object({
    PageNumber: z.
        preprocess((val) => (typeof val === "string" ? parseInt(val, 10) : val), z.number()),
    clientOrderCondition: z
        .string()
        .optional()
        .refine(
            (val): val is ClientOrderConditionType =>
                val === undefined || ClientOrderCondition.includes(val as ClientOrderConditionType),
            { message: "sellsOrderCondition debe ser 'Nombre', 'Id_Cliente'" }
        )
});


export const getClientIdQuerySchema = z.object({
    Id_Almacen: z
        .preprocess((val) => (typeof val === "string" ? parseInt(val, 10) : val), z.number()),
    Id_Cliente: z
        .preprocess((val) => (typeof val === "string" ? parseInt(val, 10) : val), z.number()),
})


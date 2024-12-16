import { z } from "zod";


// getSells
export const getOrderDetailsQuerrySchema = z.object({
    folio: z.string().nonempty(),
    PageNumber: z.
        preprocess((val) => (typeof val === "string" ? parseInt(val, 10) : val), z.number()),
})

export const getTotalOrderDetailsQuerrySchema = z.object({
    folio: z.string().nonempty()
})
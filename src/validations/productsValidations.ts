import { z } from "zod";

export const getProductsByStockQuerySchema = z.object({
    PageNumber: z.
        preprocess((val) => (typeof val === "string" ? parseInt(val, 10) : val), z.number()),
    PageSize: z.
        preprocess((val) => (typeof val === "string" ? parseInt(val, 10) : val), z.number()),
});
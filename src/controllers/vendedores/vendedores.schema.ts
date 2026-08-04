import { z } from "zod";

export const getVendedoresQuerySchema = z.object({
    PageNumber: z.coerce.number().int().min(1).default(1),
    PageSize: z.coerce.number().int().min(1).max(100).default(20),
});

export const getVendedorByIdParamsSchema = z.object({
    id: z.coerce.number().int().positive(),
});

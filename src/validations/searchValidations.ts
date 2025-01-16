import { z } from "zod";


const simpleSearchQuerySchema = z.object({
    searchTerm: z
        .string()
        .transform((val) => (val === undefined ? "" : val)),
});

export {
    simpleSearchQuerySchema
}
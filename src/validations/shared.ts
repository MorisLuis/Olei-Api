import { z } from "zod";


export const pageNumberSchema = z.preprocess(
    (val) => (typeof val === "string" ? parseInt(val, 10) : val),
    z.number()
);

export const booleanNumberFilterSchema = z
    .string()
    .optional()
    .transform((val) => (val ? (Number(val) === 1 ? 1 : 0) : 0));

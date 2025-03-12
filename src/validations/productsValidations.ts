import { z } from "zod";


export const getProductsQuerySchema = z.object({
    page: z.
        preprocess((val) => (typeof val === "string" ? parseInt(val, 10) : val), z.number()),
    limit: z.
        preprocess((val) => (typeof val === "string" ? parseInt(val, 10) : val), z.number()),
    nombre: z
        .string()
        .transform((val) => (val === undefined ? "" : val)),
    marca: z
        .string()
        .transform((val) => (val === undefined ? "" : val)),
    familia: z
        .string()
        .transform((val) => (val === undefined ? "" : val)),
    folio: z
        .string()
        .transform((val) => (val === undefined ? "" : val))
});

export const getProducByIdWebQuerySchema = z.object({
    Marca: z
        .string()
        .transform((val) => (val === undefined ? "" : val)),
});


export const getTotalProductsQuerySchema = z.object({
    nombre: z
        .string()
        .optional()
        .transform((val) => (val === undefined ? "" : val)),
    marca: z
        .string()
        .optional()
        .transform((val) => (val === undefined ? "" : val)),
    familia: z
        .string()
        .optional()
        .transform((val) => (val === undefined ? "" : val)),
    folio: z
        .string()
        .optional()
        .transform((val) => (val === undefined ? "" : val))
});

export const serachProductQuerySchema = z.object({
    nombre: z
        .string()
        .optional()
        .transform((val) => (val === undefined ? "" : val)),
    marca: z
        .string()
        .optional()
        .transform((val) => (val === undefined ? "" : val)),
    familia: z
        .string()
        .optional()
        .transform((val) => (val === undefined ? "" : val)),
    codigo: z
        .string()
        .optional()
        .transform((val) => (val === undefined ? "" : val))
});


// App

export const getProductsByStockQuerySchema = z.object({
    PageNumber: z.
        preprocess((val) => (typeof val === "string" ? parseInt(val, 10) : val), z.number()),
    PageSize: z.
        preprocess((val) => (typeof val === "string" ? parseInt(val, 10) : val), z.number()),
});

export const getProductByStockAndCodeBarSchema = z.object({
    CodBar: z.string().default(""),
    Codigo: z.string().default(""),
    SKU: z.string().default("")
  });
  
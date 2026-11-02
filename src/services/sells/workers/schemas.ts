import { z } from 'zod';
import type {
    SellReportWorkerRequest,
    SellReportWorkerResponse,
} from './types';

export const sellReportWorkerRequestSchema:
    z.ZodType<SellReportWorkerRequest> = z.object({
        id: z.number().int().positive(),
        input: z.object({
            sellDetails: z.object({
                name: z.string(),
                date: z.string(),
                address: z.string(),
                phoneNumber: z.string(),
                email: z.string(),
                seller: z.string(),
                iva: z.string(),
                subtotal: z.string(),
                total: z.string(),
                Folio: z.string(),
                TipoDocNombre: z.string(),
            }),
            sells: z.array(z.object({
                sku: z.string(),
                quntity: z.number().finite(),
                description: z.string(),
                unitPrice: z.number().finite(),
                subtotal: z.number().finite(),
            })),
        }),
    });

export const sellReportWorkerResponseSchema:
    z.ZodType<SellReportWorkerResponse> = z.discriminatedUnion('type', [
        z.object({
            type: z.literal('ready'),
        }),
        z.object({
            type: z.literal('success'),
            id: z.number().int().positive(),
            pdfBytes: z.instanceof(Uint8Array),
            fileName: z.string(),
        }),
        z.object({
            type: z.literal('error'),
            id: z.number().int().positive(),
            message: z.string(),
        }),
    ]);

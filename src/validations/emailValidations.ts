import { z } from "zod";


export const emailBodySchema = z.object({
    destinatario: z.string().min(1, "El destinatario es requerido"),
    remitente: z.string().min(1, "El remitente es requerido"),
    subject: z.string().min(1, "El asunto es requerido"),
    text: z.string().min(1, "El texto es requerido")
});


export const emailCobranzaBodySchema = z.object({
    destinatario: z.string().min(1, "El destinatario es requerido"),
    remitente: z.string().min(1, "El remitente es requerido"),
    subject: z.string().min(1, "El asunto es requerido"),
    text: z.string().min(1, "El texto es requerido"),
    nombreRemitente: z.string().min(1, "El nombre del remitente es requerido"),
    Id_Almacen: z.number().transform((val) => (val ? val.toString() : '0'))
});
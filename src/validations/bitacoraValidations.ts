import { z } from "zod";
import MeetingInterface, { MeetingFilterConditionType, MeetingOrderCondition, MeetingOrderConditionType, validTipoContacto } from "../interface/meeting";


export const getMeetingsQuerySchema = z.object({
    PageNumber: z.
        preprocess((val) => (typeof val === "string" ? parseInt(val, 10) : val), z.number()),
    meetginOrderCondition: z
        .string()
        .optional()
        .refine(
            (val): val is MeetingOrderConditionType =>
                val === undefined || MeetingOrderCondition.includes(val as MeetingOrderConditionType),
            { message: "meetginOrderCondition debe ser 'Nombre', 'Saldo', 'Total'" }
        ),
    TipoContacto: z
        .preprocess(
            (val) => (val === "undefined" ? undefined : val),
            z.string().optional()
        )
        .optional()
        .transform((val) => (val ? parseInt(val, 10) : 0)) // Convierte a número
        .refine(
            (val): val is MeetingInterface["TipoContacto"] => validTipoContacto.includes(val as MeetingInterface["TipoContacto"]),
            { message: "TipoDoc debe ser 0, 1 o 2" }
        ),
    Id_Cliente: z
        .preprocess(
            (val) => (val === "undefined" ? undefined : val),
            z.string().optional()
        )
        .optional()
        .transform((val) => (val ? parseInt(val, 10) : 0)) // Convertimos a número
        .refine((val) => val >= 0, { message: "Id_Cliente debe ser un número positivo" }),
    FilterTipoContacto: z.string().optional().transform((val) => (val ? Number(val) === 1 ? 1 : 0 : 0)),
    FilterCliente: z.string().optional().transform((val) => (val ? Number(val) === 1 ? 1 : 0 : 0)),

});

export const getTotalMeetingsQuerySchema = z.object({
    TipoContacto: z
        .preprocess(
            (val) => (val === "undefined" ? undefined : val),
            z.string().optional()
        )
        .optional()
        .transform((val) => (val ? parseInt(val, 10) : 0)) // Convierte a número
        .refine(
            (val): val is MeetingInterface["TipoContacto"] => validTipoContacto.includes(val as MeetingInterface["TipoContacto"]),
            { message: "TipoDoc debe ser 0, 1 o 2" }
        ),
    Id_Cliente: z
        .preprocess(
            (val) => (val === "undefined" ? undefined : val),
            z.string().optional()
        )
        .optional()
        .transform((val) => (val ? parseInt(val, 10) : 0)) // Convertimos a número
        .refine((val) => val >= 0, { message: "Id_Cliente debe ser un número positivo" }),
    FilterTipoContacto: z.string().optional().transform((val) => (val ? Number(val) === 1 ? 1 : 0 : 0)),
    FilterCliente: z.string().optional().transform((val) => (val ? Number(val) === 1 ? 1 : 0 : 0)),
});

export const postBitacoraBodySchema = z.object({
    Fecha: z.preprocess((val) => (typeof val === "string" ? new Date(val) : val), z.date()),
    Titulo: z.string().nonempty("El título es obligatorio."),
    TipoContacto: z
        .union([z.string(), z.number()]) // Permite que sea string o number
        .transform((val) => (typeof val === "string" ? parseInt(val, 10) : val)) // Convierte string a número si es necesario
        .refine(
            (val): val is MeetingInterface["TipoContacto"] => validTipoContacto.includes(val as MeetingInterface['TipoContacto']),
            { message: "TipoContacto debe ser 0, 1, 2, 3 o 4" }
        ),
    Descripcion: z.string().optional(),
    HourEnd: z.string().optional(),
    Hour: z.string().optional(), // Puede ser una cadena o undefined
    Id_Almacen: z.number().int().positive().optional(), // Opcional
    Id_Cliente: z.number().int().positive().optional(), // Opcional
    Comentarios: z.string().optional(),
})

export const updateBitacoraBodySchema = z.object({
    Fecha: z.preprocess((val) => (typeof val === "string" ? new Date(val) : val), z.date()).optional(),
    Titulo: z.string().nonempty("El título es obligatorio.").optional(),
    TipoContacto: z
        .union([z.string(), z.number()]) // Permite que sea string o number
        .transform((val) => (typeof val === "string" ? parseInt(val, 10) : val)) // Convierte string a número si es necesario
        .refine(
            (val): val is MeetingInterface["TipoContacto"] => validTipoContacto.includes(val as MeetingInterface['TipoContacto']),
            { message: "TipoContacto debe ser 0, 1, 2, 3 o 4" }
        )
        .optional()
    ,
    Descripcion: z.string().optional(),
    HourEnd: z.string().optional(),
    Hour: z.string().optional(), // Puede ser una cadena o undefined
    Id_Almacen: z.number().int().positive().optional(), // Opcional
    Id_Cliente: z.number().int().positive().optional(), // Opcional
    Comentarios: z.string().optional(),
})
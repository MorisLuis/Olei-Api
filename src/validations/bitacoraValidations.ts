import { z } from "zod";
import type { MeetingOrderConditionType } from "../interface/meeting";
import type MeetingInterface from "../interface/meeting";
import { MeetingOrderCondition, validTipoContacto } from "../interface/meeting";


export const getMeetingsQuerySchema = z.object({
    PageNumber: z
        .preprocess((val) => (typeof val === "string" ? parseInt(val, 10) : val), z.number())
        .refine((val) => val > 0 && val < 100, { message: "PageNumber debe ser un número positivo mayor que 0 y menor que 100" }),

    meetingOrderCondition: z
        .string()
        .refine(
            (val): val is MeetingOrderConditionType =>
                val === undefined || MeetingOrderCondition.includes(val as MeetingOrderConditionType),
            { message: "meetingOrderCondition debe ser 'Nombre', 'Saldo', 'Total'" }
        ),

    FilterCliente: z.union([z.string(), z.number()]).optional().transform((val) => (val ? Number(val) === 1 ? 1 : 0 : 0)),

    TipoContacto: z
        .union([z.string(), z.number()]) // Permite que sea string o number
        .transform((val) => (typeof val === "string" ? parseInt(val, 10) : val))
        .optional()
        .refine(
            (val): val is MeetingInterface["TipoContacto"] => validTipoContacto.includes(val as MeetingInterface['TipoContacto']),
            { message: "TipoContacto debe ser 0, 1, 2, 3 o 4" }
        ),

    Id_Cliente: z
        .preprocess(
            (val) => (val === "undefined" ? undefined : val),
            z.string().optional()
        )
        .optional()
        .transform((val) => (val ? parseInt(val, 10) : 0)) // Convertimos a número
        .refine((val) => val >= 0, { message: "Id_Cliente debe ser un número positivo" }),

    searchTerm: z.preprocess((val) => (val === '' ? undefined : val), z.string().optional())

});

export const getTotalMeetingsQuerySchema = z.object({
    FilterTipoContacto: z.union([z.string(), z.number()]).optional().transform((val) => (val ? Number(val) === 1 ? 1 : 0 : 0)),
    FilterCliente: z.union([z.string(), z.number()]).optional().transform((val) => (val ? Number(val) === 1 ? 1 : 0 : 0)),

    TipoContacto: z
        .union([z.string(), z.number()]) // Permite que sea string o number
        .transform((val) => (typeof val === "string" ? parseInt(val, 10) : val))
        .optional()
        .refine(
            (val): val is MeetingInterface["TipoContacto"] => validTipoContacto.includes(val as MeetingInterface['TipoContacto']),
            { message: "TipoContacto debe ser 0, 1, 2, 3 o 4" }
        ),

    Id_Cliente: z
        .preprocess(
            (val) => (val === "undefined" ? undefined : val),
            z.string().optional()
        )
        .optional()
        .transform((val) => (val ? parseInt(val, 10) : 0)) // Convertimos a número
        .refine((val) => val >= 0, { message: "Id_Cliente debe ser un número positivo" }),
});

export const getMeetingByIdParmsSchema = z.object({
    id: z
        .preprocess((val) => (typeof val === "string" ? parseInt(val, 10) : val), z.number())
});

export const postBitacoraBodySchema = z.object({
    Fecha: z
        .preprocess((val) => (typeof val === "string" ? new Date(val) : val), z.date())
        .refine((val) => !isNaN(val.getTime()), { message: "Fecha debe ser una fecha válida." }),

    TipoContacto: z
        .union([z.string(), z.number()]) // Permite que sea string o number
        .transform((val) => (typeof val === "string" ? parseInt(val, 10) : val)) // Convierte string a número si es necesario
        .refine(
            (val): val is MeetingInterface["TipoContacto"] => validTipoContacto.includes(val as MeetingInterface['TipoContacto']),
            { message: "TipoContacto debe ser 0, 1, 2, 3 o 4" }
        ),

    Descripcion: z.string().optional(),

    HourEnd: z
        .string()
        .optional()
        .refine(val => val ? val.length <= 5 : true, { message: "HourEnd no puede tener más de 5 caracteres." }),

    Hour: z
        .string()
        .optional()
        .refine(val => val ? val.length <= 5 : true, { message: "Hour no puede tener más de 5 caracteres." }),

    Id_Almacen: z.number().int().positive().optional(),
    Id_Cliente: z.number().int().positive().optional(),
    Comentarios: z.string().optional(),
})

export const updateBitacoraBodySchema = z.object({
    Fecha: z
        .preprocess((val) => (typeof val === "string" ? new Date(val) : val), z.date())
        .refine((val) => !isNaN(val.getTime()), { message: "Fecha debe ser una fecha válida." })
        .optional(),

    Titulo: z
        .string()
        .optional(),

    TipoContacto: z
        .union([z.string(), z.number()]) // Permite que sea string o number
        .transform((val) => (typeof val === "string" ? parseInt(val, 10) : val)) // Convierte string a número si es necesario
        .refine(
            (val): val is MeetingInterface["TipoContacto"] => validTipoContacto.includes(val as MeetingInterface['TipoContacto']),
            { message: "TipoContacto debe ser 0, 1, 2, 3 o 4" }
        )
        .optional(),

    Descripcion: z.string().optional(),

    HourEnd: z
        .string()
        .optional()
        .refine(val => val ? val.length <= 5 : true, { message: "HourEnd no puede tener más de 5 caracteres." }),

    Hour: z
        .string()
        .optional()
        .refine(val => val ? val.length <= 5 : true, { message: "Hour no puede tener más de 5 caracteres." }),

    Id_Almacen: z.number().int().positive().optional(),
    Id_Cliente: z.number().int().positive().optional(),
    Comentarios: z.string().optional()
})
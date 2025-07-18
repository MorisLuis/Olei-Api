import { z } from "zod";

export const getCalendarTaskByMonthQuerySchema = z.object({
    Anio: z
        .union([z.string().max(4), z.number()])
        .transform((val) => String(val))
        .refine((val) => /^[0-9]{4}$/.test(val), { message: 'Anio debe ser un número de 4 dígitos' }),

    Mes: z
        .union([z.string(), z.number()])
        .transform((val) => String(val).padStart(2, '0')) // Asegura formato de dos dígitos
        .refine((val) => /^(0[1-9]|1[0-2])$/.test(val), { message: 'Mes debe estar entre 01 y 12' })
});


export const getCalendarTaskByDayQuerySchema = z.object({
    Day: z
        .union([
            // Validación de string en formato 'YYYY-MM-DD' o 'DD-MM-YYYY'
            z.string().refine((val) => {
                // Valida los formatos 'YYYY-MM-DD' o 'DD-MM-YYYY'
                return /^\d{4}-\d{2}-\d{2}$/.test(val) || /^\d{2}-\d{2}-\d{4}$/.test(val);
            }, {
                message: 'Day debe estar en formato "YYYY-MM-DD" o "DD-MM-YYYY"',
            }),
            // Validación de formato ISO (con hora y zona horaria)
            z.string().refine((val) => {
                return /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}.\d{3}Z$/.test(val);
            }, {
                message: 'Day debe estar en formato ISO "YYYY-MM-DDTHH:MM:SS.MMMZ"',
            }),
            // Validación de Date
            z.date().refine((val) => {
                return !isNaN(val.getTime()); // Valida que sea una fecha válida
            }, {
                message: 'Day debe ser una fecha válida',
            })
        ])
        .transform((val) => {
            // Si es un Date, lo transformamos en formato string
            if (val instanceof Date) {
                // Formato 'YYYY-MM-DD'
                const year = val.getFullYear();
                const month = String(val.getMonth() + 1).padStart(2, '0');
                const day = String(val.getDate()).padStart(2, '0');

                // Convertimos a formato 'YYYY-MM-DD'
                return `${year}-${month}-${day}`;
            }

            // Si es una cadena en formato ISO, la convertimos a Date
            if (typeof val === 'string' && /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}.\d{3}Z$/.test(val)) {
                const date = new Date(val);  // Convierte a objeto Date
                const year = date.getFullYear();
                const month = String(date.getMonth() + 1).padStart(2, '0');
                const day = String(date.getDate()).padStart(2, '0');
                return `${year}-${month}-${day}`; // Devuelve en formato 'YYYY-MM-DD'
            }

            return val;
        }),

    Id_Cliente: z.preprocess((val) => {
        if (val === 'null' || val === undefined) return null;
        if (typeof val === 'string') return parseInt(val, 10);
        return val;
    }, z.number().nullable())
});


export const getCalendarByMonthAndClientQuerySchema = z.object({
    Anio: z
        .union([z.string().max(4), z.number()])
        .transform((val) => String(val))
        .refine((val) => /^[0-9]{4}$/.test(val), { message: 'Anio debe ser un número de 4 dígitos' }),

    Mes: z
        .union([z.string(), z.number()])
        .transform((val) => String(val).padStart(2, '0'))
        .refine((val) => /^(0[1-9]|1[0-2])$/.test(val), { message: 'Mes debe estar entre 01 y 12' }),

    Id_Cliente: z
        .preprocess((val) => (typeof val === "string" ? parseInt(val, 10) : val), z.number())
})
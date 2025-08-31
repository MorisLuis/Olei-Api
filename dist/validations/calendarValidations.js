"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getCalendarByMonthAndClientQuerySchema = exports.getCalendarTaskByDayQuerySchema = exports.getCalendarTaskByMonthQuerySchema = void 0;
const zod_1 = require("zod");
exports.getCalendarTaskByMonthQuerySchema = zod_1.z.object({
    Anio: zod_1.z
        .union([zod_1.z.string().max(4), zod_1.z.number()])
        .transform((val) => String(val))
        .refine((val) => /^[0-9]{4}$/.test(val), { message: 'Anio debe ser un número de 4 dígitos' }),
    Mes: zod_1.z
        .union([zod_1.z.string(), zod_1.z.number()])
        .transform((val) => String(val).padStart(2, '0')) // Asegura formato de dos dígitos
        .refine((val) => /^(0[1-9]|1[0-2])$/.test(val), { message: 'Mes debe estar entre 01 y 12' })
});
exports.getCalendarTaskByDayQuerySchema = zod_1.z.object({
    PageNumber: zod_1.z
        .preprocess((val) => (typeof val === "string" ? parseInt(val, 10) : val), zod_1.z.number())
        .refine((val) => val > 0 && val < 100, { message: "PageNumber debe ser un número positivo mayor que 0 y menor que 100" }).optional(),
    limit: zod_1.z
        .preprocess((val) => (typeof val === "string" ? parseInt(val, 10) : val), zod_1.z.number()).optional(),
    Day: zod_1.z
        .union([
        // Validación de string en formato 'YYYY-MM-DD' o 'DD-MM-YYYY'
        zod_1.z.string().refine((val) => {
            // Valida los formatos 'YYYY-MM-DD' o 'DD-MM-YYYY'
            return /^\d{4}-\d{2}-\d{2}$/.test(val) || /^\d{2}-\d{2}-\d{4}$/.test(val);
        }, {
            message: 'Day debe estar en formato "YYYY-MM-DD" o "DD-MM-YYYY"',
        }),
        // Validación de formato ISO (con hora y zona horaria)
        zod_1.z.string().refine((val) => {
            return /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}.\d{3}Z$/.test(val);
        }, {
            message: 'Day debe estar en formato ISO "YYYY-MM-DDTHH:MM:SS.MMMZ"',
        }),
        // Validación de Date
        zod_1.z.date().refine((val) => {
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
            const date = new Date(val); // Convierte a objeto Date
            const year = date.getFullYear();
            const month = String(date.getMonth() + 1).padStart(2, '0');
            const day = String(date.getDate()).padStart(2, '0');
            return `${year}-${month}-${day}`; // Devuelve en formato 'YYYY-MM-DD'
        }
        return val;
    }),
    Id_Cliente: zod_1.z.preprocess((val) => {
        if (val === 'null' || val === undefined)
            return null;
        if (typeof val === 'string')
            return parseInt(val, 10);
        return val;
    }, zod_1.z.number().nullable())
});
exports.getCalendarByMonthAndClientQuerySchema = zod_1.z.object({
    Anio: zod_1.z
        .union([zod_1.z.string().max(4), zod_1.z.number()])
        .transform((val) => String(val))
        .refine((val) => /^[0-9]{4}$/.test(val), { message: 'Anio debe ser un número de 4 dígitos' }),
    Mes: zod_1.z
        .union([zod_1.z.string(), zod_1.z.number()])
        .transform((val) => String(val).padStart(2, '0'))
        .refine((val) => /^(0[1-9]|1[0-2])$/.test(val), { message: 'Mes debe estar entre 01 y 12' }),
    Id_Cliente: zod_1.z
        .preprocess((val) => (typeof val === "string" ? parseInt(val, 10) : val), zod_1.z.number())
});
//# sourceMappingURL=calendarValidations.js.map
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.updateBitacoraBodySchema = exports.postBitacoraBodySchema = exports.getMeetingByIdParmsSchema = exports.getTotalMeetingsQuerySchema = exports.getMeetingsQuerySchema = void 0;
const zod_1 = require("zod");
const meeting_1 = require("../interface/meeting");
exports.getMeetingsQuerySchema = zod_1.z.object({
    PageNumber: zod_1.z
        .preprocess((val) => (typeof val === "string" ? parseInt(val, 10) : val), zod_1.z.number())
        .refine((val) => val > 0 && val < 100, { message: "PageNumber debe ser un número positivo mayor que 0 y menor que 100" }),
    meetingOrderCondition: zod_1.z
        .string()
        .refine((val) => val === undefined || meeting_1.MeetingOrderCondition.includes(val), { message: "meetingOrderCondition debe ser 'Nombre', 'Saldo', 'Total'" }),
    FilterCliente: zod_1.z.union([zod_1.z.string(), zod_1.z.number()]).optional().transform((val) => (val ? Number(val) === 1 ? 1 : 0 : 0)),
    TipoContacto: zod_1.z
        .union([zod_1.z.string(), zod_1.z.number()]) // Permite que sea string o number
        .transform((val) => (typeof val === "string" ? parseInt(val, 10) : val))
        .optional()
        .refine((val) => meeting_1.validTipoContacto.includes(val), { message: "TipoContacto debe ser 0, 1, 2, 3 o 4" }),
    Id_Cliente: zod_1.z
        .preprocess((val) => (val === "undefined" ? undefined : val), zod_1.z.string().optional())
        .optional()
        .transform((val) => (val ? parseInt(val, 10) : 0)) // Convertimos a número
        .refine((val) => val >= 0, { message: "Id_Cliente debe ser un número positivo" }),
    searchTerm: zod_1.z.preprocess((val) => (val === '' ? undefined : val), zod_1.z.string().optional()),
    status: zod_1.z.union([zod_1.z.string(), zod_1.z.number()]).optional().transform((val) => (val ? Number(val) === 1 ? 1 : 0 : 0)),
});
exports.getTotalMeetingsQuerySchema = zod_1.z.object({
    FilterTipoContacto: zod_1.z.union([zod_1.z.string(), zod_1.z.number()]).optional().transform((val) => (val ? Number(val) === 1 ? 1 : 0 : 0)),
    FilterCliente: zod_1.z.union([zod_1.z.string(), zod_1.z.number()]).optional().transform((val) => (val ? Number(val) === 1 ? 1 : 0 : 0)),
    TipoContacto: zod_1.z
        .union([zod_1.z.string(), zod_1.z.number()]) // Permite que sea string o number
        .transform((val) => (typeof val === "string" ? parseInt(val, 10) : val))
        .optional()
        .refine((val) => meeting_1.validTipoContacto.includes(val), { message: "TipoContacto debe ser 0, 1, 2, 3 o 4" }),
    Id_Cliente: zod_1.z
        .preprocess((val) => (val === "undefined" ? undefined : val), zod_1.z.string().optional())
        .optional()
        .transform((val) => (val ? parseInt(val, 10) : 0)) // Convertimos a número
        .refine((val) => val >= 0, { message: "Id_Cliente debe ser un número positivo" }),
});
exports.getMeetingByIdParmsSchema = zod_1.z.object({
    id: zod_1.z
        .preprocess((val) => (typeof val === "string" ? parseInt(val, 10) : val), zod_1.z.number())
});
exports.postBitacoraBodySchema = zod_1.z.object({
    Fecha: zod_1.z
        .preprocess((val) => (typeof val === "string" ? new Date(val) : val), zod_1.z.date())
        .refine((val) => !isNaN(val.getTime()), { message: "Fecha debe ser una fecha válida." }),
    TipoContacto: zod_1.z
        .union([zod_1.z.string(), zod_1.z.number()]) // Permite que sea string o number
        .transform((val) => (typeof val === "string" ? parseInt(val, 10) : val)) // Convierte string a número si es necesario
        .refine((val) => meeting_1.validTipoContacto.includes(val), { message: "TipoContacto debe ser 0, 1, 2, 3 o 4" }),
    Descripcion: zod_1.z.string().optional(),
    HourEnd: zod_1.z
        .string()
        .optional()
        .refine(val => val ? val.length <= 5 : true, { message: "HourEnd no puede tener más de 5 caracteres." }),
    Hour: zod_1.z
        .string()
        .optional()
        .refine(val => val ? val.length <= 5 : true, { message: "Hour no puede tener más de 5 caracteres." }),
    Id_Almacen: zod_1.z.number().int().positive().optional(),
    Id_Cliente: zod_1.z.number().int().positive().optional(),
    Comentarios: zod_1.z.string().optional(),
});
exports.updateBitacoraBodySchema = zod_1.z.object({
    Fecha: zod_1.z
        .preprocess((val) => (typeof val === "string" ? new Date(val) : val), zod_1.z.date())
        .refine((val) => !isNaN(val.getTime()), { message: "Fecha debe ser una fecha válida." })
        .optional(),
    Titulo: zod_1.z
        .string()
        .optional(),
    TipoContacto: zod_1.z
        .union([zod_1.z.string(), zod_1.z.number()]) // Permite que sea string o number
        .transform((val) => (typeof val === "string" ? parseInt(val, 10) : val)) // Convierte string a número si es necesario
        .refine((val) => meeting_1.validTipoContacto.includes(val), { message: "TipoContacto debe ser 0, 1, 2, 3 o 4" })
        .optional(),
    Descripcion: zod_1.z.string().optional(),
    HourEnd: zod_1.z
        .string()
        .optional()
        .refine(val => val ? val.length <= 5 : true, { message: "HourEnd no puede tener más de 5 caracteres." }),
    Hour: zod_1.z
        .string()
        .optional()
        .refine(val => val ? val.length <= 5 : true, { message: "Hour no puede tener más de 5 caracteres." }),
    Id_Almacen: zod_1.z.number().int().positive().optional(),
    Id_Cliente: zod_1.z.number().int().positive().optional(),
    Comentarios: zod_1.z.string().optional(),
    status: zod_1.z.boolean().optional().default(true)
});
//# sourceMappingURL=bitacoraValidations.js.map
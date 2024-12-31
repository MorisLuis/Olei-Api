"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.updateBitacoraBodySchema = exports.postBitacoraBodySchema = exports.getTotalMeetingsQuerySchema = exports.getMeetingsQuerySchema = void 0;
const zod_1 = require("zod");
const meeting_1 = require("../interface/meeting");
exports.getMeetingsQuerySchema = zod_1.z.object({
    PageNumber: zod_1.z.
        preprocess((val) => (typeof val === "string" ? parseInt(val, 10) : val), zod_1.z.number()),
    meetginOrderCondition: zod_1.z
        .string()
        .refine((val) => val === undefined || meeting_1.MeetingOrderCondition.includes(val), { message: "meetginOrderCondition debe ser 'Nombre', 'Saldo', 'Total'" }),
    TipoContacto: zod_1.z
        .preprocess((val) => (val === "undefined" ? undefined : val), zod_1.z.string().optional())
        .optional()
        .transform((val) => (val ? parseInt(val, 10) : 0)) // Convierte a número
        .refine((val) => meeting_1.validTipoContacto.includes(val), { message: "TipoDoc debe ser 0, 1 o 2" }),
    Id_Cliente: zod_1.z
        .preprocess((val) => (val === "undefined" ? undefined : val), zod_1.z.string().optional())
        .optional()
        .transform((val) => (val ? parseInt(val, 10) : 0)) // Convertimos a número
        .refine((val) => val >= 0, { message: "Id_Cliente debe ser un número positivo" }),
    FilterTipoContacto: zod_1.z.string().optional().transform((val) => (val ? Number(val) === 1 ? 1 : 0 : 0)),
    FilterCliente: zod_1.z.string().optional().transform((val) => (val ? Number(val) === 1 ? 1 : 0 : 0)),
});
exports.getTotalMeetingsQuerySchema = zod_1.z.object({
    TipoContacto: zod_1.z
        .preprocess((val) => (val === "undefined" ? undefined : val), zod_1.z.string().optional())
        .optional()
        .transform((val) => (val ? parseInt(val, 10) : 0)) // Convierte a número
        .refine((val) => meeting_1.validTipoContacto.includes(val), { message: "TipoDoc debe ser 0, 1 o 2" }),
    Id_Cliente: zod_1.z
        .preprocess((val) => (val === "undefined" ? undefined : val), zod_1.z.string().optional())
        .optional()
        .transform((val) => (val ? parseInt(val, 10) : 0)) // Convertimos a número
        .refine((val) => val >= 0, { message: "Id_Cliente debe ser un número positivo" }),
    FilterTipoContacto: zod_1.z.string().optional().transform((val) => (val ? Number(val) === 1 ? 1 : 0 : 0)),
    FilterCliente: zod_1.z.string().optional().transform((val) => (val ? Number(val) === 1 ? 1 : 0 : 0)),
});
exports.postBitacoraBodySchema = zod_1.z.object({
    Fecha: zod_1.z.preprocess((val) => (typeof val === "string" ? new Date(val) : val), zod_1.z.date()),
    Titulo: zod_1.z.string().nonempty("El título es obligatorio."),
    TipoContacto: zod_1.z
        .union([zod_1.z.string(), zod_1.z.number()]) // Permite que sea string o number
        .transform((val) => (typeof val === "string" ? parseInt(val, 10) : val)) // Convierte string a número si es necesario
        .refine((val) => meeting_1.validTipoContacto.includes(val), { message: "TipoContacto debe ser 0, 1, 2, 3 o 4" }),
    Descripcion: zod_1.z.string().optional(),
    HourEnd: zod_1.z.string().optional(),
    Hour: zod_1.z.string().optional(), // Puede ser una cadena o undefined
    Id_Almacen: zod_1.z.number().int().positive().optional(), // Opcional
    Id_Cliente: zod_1.z.number().int().positive().optional(), // Opcional
    Comentarios: zod_1.z.string().optional(),
});
exports.updateBitacoraBodySchema = zod_1.z.object({
    Fecha: zod_1.z.preprocess((val) => (typeof val === "string" ? new Date(val) : val), zod_1.z.date()).optional(),
    Titulo: zod_1.z.string().nonempty("El título es obligatorio.").optional(),
    TipoContacto: zod_1.z
        .union([zod_1.z.string(), zod_1.z.number()]) // Permite que sea string o number
        .transform((val) => (typeof val === "string" ? parseInt(val, 10) : val)) // Convierte string a número si es necesario
        .refine((val) => meeting_1.validTipoContacto.includes(val), { message: "TipoContacto debe ser 0, 1, 2, 3 o 4" })
        .optional(),
    Descripcion: zod_1.z.string().optional(),
    HourEnd: zod_1.z.string().optional(),
    Hour: zod_1.z.string().optional(), // Puede ser una cadena o undefined
    Id_Almacen: zod_1.z.number().int().positive().optional(), // Opcional
    Id_Cliente: zod_1.z.number().int().positive().optional(), // Opcional
    Comentarios: zod_1.z.string().optional(),
});
//# sourceMappingURL=bitacoraValidations.js.map
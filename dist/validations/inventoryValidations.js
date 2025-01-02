"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getInventoryQuerySchema = exports.getIdClienteQuerySchema = exports.postInventoryBodySchema = void 0;
const zod_1 = require("zod");
const inventoryDetailsItemSchema = zod_1.z.object({
    Codigo: zod_1.z
        .string()
        .max(18, { message: "Codigo no puede exceder los 18 caracteres" }),
    Id_Marca: zod_1.z
        .number()
        .int()
        .positive({ message: "Id_Marca debe ser un número entero positivo" }),
    Id_Ubicacion: zod_1.z
        .number()
        .int()
        .positive({ message: "Id_Ubicacion debe ser un número entero positivo" }),
    Diferencia: zod_1.z
        .number()
        .min(0, { message: "Diferencia debe ser un número mayor o igual a 0" }),
    SwNS: zod_1.z
        .number()
        .int()
        .min(0, { message: "SwNS debe ser 0 o 1" })
        .max(1, { message: "SwNS debe ser 0 o 1" }),
    NumsDeSerie: zod_1.z
        .string()
        .regex(/^[A-Za-z0-9-]+$/, { message: "NumsDeSerie debe contener solo letras, números o guiones" }),
    SKU: zod_1.z
        .string()
        .optional(),
    Cantidad: zod_1.z
        .number()
        .positive()
    //.max(20, { message: "SKU no puede exceder los 20 caracteres" }),
});
exports.postInventoryBodySchema = zod_1.z.object({
    inventoryDetails: zod_1.z.array(inventoryDetailsItemSchema),
    typeOfMovement: zod_1.z.object({
        Accion: zod_1.z
            .union([zod_1.z.string(), zod_1.z.number()])
            .transform((val) => (typeof val === "number" ? val.toString() : val)) // Convierte el número a string
            .refine((val) => ["1", "2", "3"].includes(val), // Validación: debe ser "1", "2" o "3"
        { message: "Accion debe ser '1', '2' o '3'" }),
        Id_TipoMovInv: zod_1.z.number().int().positive().nonnegative()
    })
});
exports.getIdClienteQuerySchema = zod_1.z.object({
    Id_Usuario: zod_1.z
        .preprocess((val) => (typeof val === "string" ? parseInt(val, 10) : val), zod_1.z.number())
});
exports.getInventoryQuerySchema = zod_1.z.object({
    Folio: zod_1.z
        .number()
        .int()
});
//# sourceMappingURL=inventoryValidations.js.map
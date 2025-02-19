"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.updateCodbarQuerySchema = void 0;
const zod_1 = require("zod");
exports.updateCodbarQuerySchema = zod_1.z.object({
    codigo: zod_1.z.string(),
    Id_Marca: zod_1.z
        .union([zod_1.z.string(), zod_1.z.number()]) // Acepta string o number
        .transform((val) => Number(val)) // Convierte a número
        .refine((val) => Number.isInteger(val) && val >= 0, {
        message: "Id_Marca debe ser un número entero no negativo",
    }),
});
//# sourceMappingURL=costosValidations.js.map
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getAlmacenByIdQuerySchema = void 0;
const zod_1 = require("zod");
exports.getAlmacenByIdQuerySchema = zod_1.z.object({
    Id_Almacen: zod_1.z
        .preprocess((val) => (val === "undefined" ? undefined : val), zod_1.z.string().optional())
        .transform((val) => (val ? parseInt(val, 10) : 0)) // Convertimos a número
        .refine((val) => val >= 0, { message: "Id_Almacen debe ser un número positivo" }),
});
//# sourceMappingURL=almacenValidations.js.map
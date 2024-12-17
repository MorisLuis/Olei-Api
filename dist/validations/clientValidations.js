"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getClientIdQuerySchema = exports.getClientsQuerySchema = void 0;
const zod_1 = require("zod");
const client_1 = require("../interface/client");
exports.getClientsQuerySchema = zod_1.z.object({
    PageNumber: zod_1.z.
        preprocess((val) => (typeof val === "string" ? parseInt(val, 10) : val), zod_1.z.number()),
    clientOrderCondition: zod_1.z
        .string()
        .optional()
        .refine((val) => val === undefined || client_1.ClientOrderCondition.includes(val), { message: "sellsOrderCondition debe ser 'Nombre', 'Id_Cliente'" })
});
exports.getClientIdQuerySchema = zod_1.z.object({
    Id_Almacen: zod_1.z
        .preprocess((val) => (typeof val === "string" ? parseInt(val, 10) : val), zod_1.z.number()),
    Id_Cliente: zod_1.z
        .preprocess((val) => (typeof val === "string" ? parseInt(val, 10) : val), zod_1.z.number()),
});
//# sourceMappingURL=clientValidations.js.map
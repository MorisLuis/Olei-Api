"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getTotalOrderDetailsQuerrySchema = exports.getOrderDetailsQuerrySchema = exports.getAllOrdersParamsSchema = exports.getOrderParamsSchema = exports.postOrderBodySchema = exports.SellsDetailsSchema = exports.SellsSchema = void 0;
const zod_1 = require("zod");
// Validación para SellsInterface
exports.SellsSchema = zod_1.z.object({
    UniqueKey: zod_1.z.string().optional(),
    Total: zod_1.z.number(),
    Subtotal: zod_1.z.number(),
    Piezas: zod_1.z.number().optional(),
});
// Validación para SellsDetailsInterface
exports.SellsDetailsSchema = zod_1.z.object({
    Codigo: zod_1.z.string(),
    Id_Marca: zod_1.z.number(),
    Cantidad: zod_1.z.number(),
    Precio: zod_1.z.number(),
    Descripcion: zod_1.z.string().nullable().optional()
});
// postOrder
exports.postOrderBodySchema = zod_1.z.object({
    sellsData: exports.SellsSchema,
    sellsDetails: zod_1.z.array(exports.SellsDetailsSchema)
});
// getOrder
exports.getOrderParamsSchema = zod_1.z.object({
    folio: zod_1.z.string()
});
// getAllOrders
exports.getAllOrdersParamsSchema = zod_1.z.object({
    page: zod_1.z
        .preprocess((val) => (typeof val === "string" ? parseInt(val, 10) : val), zod_1.z.number())
        .refine((val) => val > 0, { message: "Page debe ser un número positivo mayor que 0" }),
    limit: zod_1.z
        .preprocess((val) => (typeof val === "string" ? parseInt(val, 10) : val), zod_1.z.number())
        .refine((val) => val > 0 && val < 100, { message: "limit debe ser un número positivo mayor que 0 y menor que 100" }),
});
// getSells
exports.getOrderDetailsQuerrySchema = zod_1.z.object({
    folio: zod_1.z.string().nonempty(),
    TipoDoc: zod_1.z.preprocess((val) => (typeof val === "string" ? parseInt(val, 10) : val), zod_1.z.number()),
    PageNumber: zod_1.z.
        preprocess((val) => (typeof val === "string" ? parseInt(val, 10) : val), zod_1.z.number()),
});
exports.getTotalOrderDetailsQuerrySchema = zod_1.z.object({
    folio: zod_1.z.string().nonempty()
});
//# sourceMappingURL=orderValidations.js.map
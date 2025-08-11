"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getAbonosQuerySchema = void 0;
const zod_1 = require("zod");
const constants_1 = require("./constants");
exports.getAbonosQuerySchema = zod_1.z.object({
    PageNumber: zod_1.z
        .preprocess((val) => (typeof val === "string" ? parseInt(val, 10) : val), zod_1.z.number())
        .refine((val) => val > 0 && val < 100, {
        message: "PageNumber debe ser un número positivo mayor que 0 y menor que 100",
    }),
    limit: zod_1.z
        .preprocess((val) => (typeof val === "string" ? parseInt(val, 10) : val), zod_1.z.number())
        .refine((val) => val > 0 && val < 100, {
        message: "limit debe ser un número positivo mayor que 0 y menor que 100",
    }),
    orderField: zod_1.z.enum(["Folio", "Fecha"]).optional().default("Folio"),
    orderDirection: zod_1.z.enum(["asc", "desc"]).optional().default("asc"),
    filterField: zod_1.z.string().optional(),
    filterValue: zod_1.z.string().optional(),
})
    .superRefine((data, ctx) => {
    // Si uno existe, el otro debe existir
    if ((data.filterField && !data.filterValue) || (!data.filterField && data.filterValue)) {
        ctx.addIssue({
            code: zod_1.z.ZodIssueCode.custom,
            message: "filterField and filterValue must be provided together",
            path: ["filterField", "filterValue"],
        });
        return;
    }
    if (data.filterField && data.filterValue) {
        // Separar arrays
        const fields = data.filterField.split(",").map((f) => f.trim());
        const values = data.filterValue.split(",").map((v) => v.trim());
        // Verificar que tengan igual longitud
        if (fields.length !== values.length) {
            ctx.addIssue({
                code: zod_1.z.ZodIssueCode.custom,
                message: "filterField and filterValue must have the same number of items",
                path: ["filterField", "filterValue"],
            });
            return;
        }
        // Validar que cada field sea válido
        fields.forEach((field, i) => {
            if (!constants_1.filterField.includes(field)) {
                ctx.addIssue({
                    code: zod_1.z.ZodIssueCode.custom,
                    message: `filterField item '${field}' is not valid`,
                    path: ["filterField", i],
                });
            }
        });
    }
});
//# sourceMappingURL=abonos.schema.js.map
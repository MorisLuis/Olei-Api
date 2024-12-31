"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getCalendarByMonthAndClientQuerySchema = void 0;
const zod_1 = require("zod");
exports.getCalendarByMonthAndClientQuerySchema = zod_1.z.object({
    Anio: zod_1.z.preprocess((val) => (typeof val === "string" ? parseInt(val, 10) : val), zod_1.z.number()),
    Mes: zod_1.z.preprocess((val) => (typeof val === "string" ? parseInt(val, 10) : val), zod_1.z.number()),
    Id_Cliente: zod_1.z.preprocess((val) => (typeof val === "string" ? parseInt(val, 10) : val), zod_1.z.number())
});
//# sourceMappingURL=calendarValidations.js.map
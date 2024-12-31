import { z } from "zod";


export const getCalendarByMonthAndClientQuerySchema = z.object({
    Anio: z.preprocess((val) => (typeof val === "string" ? parseInt(val, 10) : val), z.number()),
    Mes: z.preprocess((val) => (typeof val === "string" ? parseInt(val, 10) : val), z.number()),
    Id_Cliente: z.preprocess((val) => (typeof val === "string" ? parseInt(val, 10) : val), z.number())
})
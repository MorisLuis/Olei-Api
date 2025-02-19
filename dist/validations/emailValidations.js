"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.emailCobranzaBodySchema = exports.emailBodySchema = void 0;
const zod_1 = require("zod");
exports.emailBodySchema = zod_1.z.object({
    destinatario: zod_1.z.string().min(1, "El destinatario es requerido"),
    remitente: zod_1.z.string().min(1, "El remitente es requerido"),
    subject: zod_1.z.string().min(1, "El asunto es requerido"),
    text: zod_1.z.string().min(1, "El texto es requerido")
});
exports.emailCobranzaBodySchema = zod_1.z.object({
    destinatario: zod_1.z.string().min(1, "El destinatario es requerido"),
    remitente: zod_1.z.string().min(1, "El remitente es requerido"),
    subject: zod_1.z.string().min(1, "El asunto es requerido"),
    text: zod_1.z.string().min(1, "El texto es requerido"),
    nombreRemitente: zod_1.z.string().min(1, "El nombre del remitente es requerido")
});
//# sourceMappingURL=emailValidations.js.map
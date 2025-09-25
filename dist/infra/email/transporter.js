"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.handleTransporter = exports.transportDefault = void 0;
const nodemailer_1 = __importDefault(require("nodemailer"));
;
exports.transportDefault = {
    host: 'mail.oleisoftware.com.mx',
    port: 465,
    secure: true,
    auth: {
        user: 'idaliahc@oleisoftware.com.mx', // Tu usuario SMTP
        pass: 'Anaregina24.', // Tu contraseña SMTP
    }
};
/* idaliahc@oleisoftware.com.mx' */
const handleTransporter = (values) => {
    return nodemailer_1.default.createTransport({
        host: values.host,
        port: values.port,
        secure: values.secure,
        auth: {
            user: values.auth.user, // Tu usuario SMTP
            pass: values.auth.pass, // Tu contraseña SMTP
        },
    });
};
exports.handleTransporter = handleTransporter;
//# sourceMappingURL=transporter.js.map
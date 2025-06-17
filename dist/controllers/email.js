"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.sendEmailWithPDF = exports.sendEmail = exports.transporter = void 0;
const nodemailer_1 = __importDefault(require("nodemailer"));
const emailValidations_1 = require("../validations/emailValidations");
const sellsValidations_1 = require("../validations/sellsValidations");
const cobranzaValidations_1 = require("../validations/cobranzaValidations");
const emailService_1 = require("../services/email/emailService");
// Configurar el transporte SMTP
exports.transporter = nodemailer_1.default.createTransport({
    host: 'smtp.gmail.com',
    port: 465,
    secure: true,
    auth: {
        user: 'moradoluisenrique@gmail.com', // Tu usuario SMTP
        pass: process.env.KEY_EMAIL, // Tu contraseña SMTP
    },
});
const sendEmail = async (req, res, next) => {
    const { destinatario, remitente, subject, text } = emailValidations_1.emailBodySchema.parse(req.body);
    // Opciones del correo
    const mailOptions = {
        from: '"Olei Software" <moradoluisenrique@gmail.com>',
        to: destinatario,
        subject: subject,
        text: text,
        replyTo: remitente
    };
    try {
        await exports.transporter.sendMail(mailOptions);
        return res.json({
            ok: true
        });
    }
    catch (error) {
        return next(error);
    }
};
exports.sendEmail = sendEmail;
const sendEmailWithPDF = async (req, res, next) => {
    const { destinatario, remitente, subject, text, nombreRemitente } = emailValidations_1.emailCobranzaBodySchema.parse(req.body);
    const queryRequest = { ...req.query, Id_Almacen: '0' };
    const { PageNumber, cobranzaOrderCondition, TipoDoc, FilterExpired, FilterNotExpired, DateEnd, DateExactly, DateStart } = cobranzaValidations_1.getCobranzaByClientQuerySchema.parse(queryRequest);
    const { client } = sellsValidations_1.getClientParamsSchema.parse(req.params);
    const userSession = req.sessionWeb;
    const mailOptions = await (0, emailService_1.sendEmailWithPDFService)({
        Id_Cliente: client,
        userSession: userSession,
        destinatario,
        remitente,
        subject,
        text,
        nombreRemitente,
        PageNumber,
        SellsOrderCondition: cobranzaOrderCondition,
        TipoDoc,
        FilterExpired,
        FilterNotExpired,
        DateEnd,
        DateExactly,
        DateStart
    });
    try {
        await exports.transporter.sendMail(mailOptions);
        return res.json({
            ok: true
        });
    }
    catch (error) {
        return next(error);
    }
};
exports.sendEmailWithPDF = sendEmailWithPDF;
//# sourceMappingURL=email.js.map
"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.sendEmailWithPDF = exports.sendEmail = void 0;
const nodemailer_1 = __importDefault(require("nodemailer"));
const emailValidations_1 = require("../validations/emailValidations");
const buffer_1 = require("buffer"); // Importa Buffer si es necesario
const sellsValidations_1 = require("../validations/sellsValidations");
const generatePDF_1 = __importDefault(require("../utils/generatePDF"));
const cobranza_utils_1 = require("../services/cobranza/cobranza.utils");
// Configurar el transporte SMTP
const transporter = nodemailer_1.default.createTransport({
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
        await transporter.sendMail(mailOptions);
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
    const { PageNumber, cobranzaOrderCondition, TipoDoc, FilterExpired, FilterNotExpired, DateEnd, DateExactly, DateStart, Id_Almacen } = sellsValidations_1.getCobranzaByClientQuerySchema.parse(req.query);
    const { client } = sellsValidations_1.getClientParamsSchema.parse(req.params);
    const userSession = req.sessionWeb;
    const { sells, brief } = await (0, cobranza_utils_1.getAllCobranzaService)({
        Id_Almacen,
        userSession,
        Id_Cliente: client,
        PageNumber: PageNumber || 1,
        SellsOrderCondition: cobranzaOrderCondition,
        TipoDoc,
        FilterNotExpired,
        FilterExpired,
        DateEnd: DateEnd || null,
        DateExactly: DateExactly || null,
        DateStart: DateStart || null,
        PageSize: 10
    });
    const pdfBuffer = await (0, generatePDF_1.default)(sells, brief);
    // Opciones del correo
    const mailOptions = {
        from: '"Olei Software" <moradoluisenrique@gmail.com>',
        to: destinatario,
        subject: subject,
        text: text,
        replyTo: remitente,
        attachments: [
            {
                filename: `Cobranza-${nombreRemitente}.pdf`,
                content: buffer_1.Buffer.from(pdfBuffer),
                contentType: 'application/pdf',
            },
        ],
    };
    try {
        await transporter.sendMail(mailOptions);
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
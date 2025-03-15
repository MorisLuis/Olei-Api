"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.sendEmailWithPDF = exports.sendEmail = void 0;
const nodemailer_1 = __importDefault(require("nodemailer"));
const generatePDF_1 = require("../utils/generatePDF");
const emailValidations_1 = require("../validations/emailValidations");
const buffer_1 = require("buffer"); // Importa Buffer si es necesario
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
    const pdfBuffer = await (0, generatePDF_1.generatePDF)({ name: 'prueba', message: "Primera prueba de pdf enviada por correo" });
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
        //const info = await transporter.sendMail(mailOptions);
        //console.log('Correo enviado: %s', info.messageId);
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
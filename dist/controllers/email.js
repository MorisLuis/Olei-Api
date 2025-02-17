"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.sendEmail = void 0;
const nodemailer_1 = __importDefault(require("nodemailer"));
const sendEmail = async (req, res, next) => {
    const { destinatario, remitente, subject, text } = req.body;
    // Configurar el transporte SMTP
    const transporter = nodemailer_1.default.createTransport({
        host: 'smtp.gmail.com',
        port: 465,
        secure: true,
        auth: {
            user: 'moradoluisenrique@gmail.com', // Tu usuario SMTP
            pass: 'todv peof eahm kygy', // Tu contraseña SMTP
        },
    });
    // Opciones del correo
    const mailOptions = {
        from: '"Olei Software" <moradoluisenrique@gmail.com>',
        to: destinatario,
        subject: subject,
        text: text,
        replyTo: remitente
    };
    try {
        const info = await transporter.sendMail(mailOptions);
        console.log('Correo enviado: %s', info.messageId);
        res.json({
            ok: true
        });
    }
    catch (error) {
        console.error('Error al enviar el correo:', error);
    }
};
exports.sendEmail = sendEmail;
//# sourceMappingURL=email.js.map
"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.sendEmail = void 0;
const mail_1 = __importDefault(require("@sendgrid/mail"));
// Configura la clave API de SendGrid
mail_1.default.setApiKey('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'); // Reemplaza con tu clave API de Twilio SendGrid
const sendEmail = async (req, res, next) => {
    const { sender, senderName, recipient, recipientName, subject, htmlContent, params } = req.body;
    if (!sender || !recipient || !subject || !htmlContent) {
        return res.status(400).json({ error: 'Faltan parámetros obligatorios' });
    }
    try {
        // Crear el mensaje a enviar
        const msg = {
            to: recipient, // Dirección del destinatario
            from: 'moradoluisenrique@gmail.com', // Tu correo verificado en SendGrid
            subject: subject, // Asunto del correo
            html: htmlContent, // Contenido en HTML del correo
            // En este caso no usamos params directamente, pero puedes agregar dinámicamente en el HTML
            // params, // Si quieres incluir parámetros adicionales en el correo, por ejemplo, en el cuerpo del mensaje
        };
        // Enviar el correo utilizando la API de SendGrid
        await mail_1.default.send(msg);
        // Responder con éxito
        res.status(200).json({ message: 'Correo enviado exitosamente' });
    }
    catch (error) {
        console.error('Error al enviar el correo:', error);
        res.status(500).json({
            error: 'Error al enviar el correo',
            details: error.response?.body || error.message,
        });
    }
};
exports.sendEmail = sendEmail;
//# sourceMappingURL=email.js.map
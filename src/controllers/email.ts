import { NextFunction, Request, Response } from 'express';
import sgMail from '@sendgrid/mail';

// Configura la clave API de SendGrid
sgMail.setApiKey('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'); // Reemplaza con tu clave API de Twilio SendGrid

export const sendEmail = async (req: Request, res: Response, next: NextFunction) => {
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
        await sgMail.send(msg);

        // Responder con éxito
        res.status(200).json({ message: 'Correo enviado exitosamente' });
    } catch (error: any) {
        console.error('Error al enviar el correo:', error);
        res.status(500).json({
            error: 'Error al enviar el correo',
            details: error.response?.body || error.message,
        });
    }
};
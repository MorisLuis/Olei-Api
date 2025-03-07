import { NextFunction, Request, Response } from 'express';
import nodemailer from 'nodemailer';
import { generatePDF } from '../utils/generatePDF';
import { emailBodySchema, emailCobranzaBodySchema } from '../validations/emailValidations';

// Configurar el transporte SMTP
const transporter = nodemailer.createTransport({
    host: 'smtp.gmail.com',
    port: 465,
    secure: true,
    auth: {
        user: 'moradoluisenrique@gmail.com', // Tu usuario SMTP
        pass: process.env.KEY_EMAIL, // Tu contraseña SMTP
    },
});


const sendEmail = async (req: Request, res: Response, next: NextFunction) => {

    const { destinatario, remitente, subject, text } = emailBodySchema.parse(req.body)

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

        res.json({
            ok: true
        });

    } catch (error) {
        next(error)
    }
};

const sendEmailWithPDF = async (req: Request, res: Response, next: NextFunction) => {

    const { destinatario, remitente, subject, text, nombreRemitente } = emailCobranzaBodySchema.parse(req.body)
    const pdfBuffer = await generatePDF({ name: 'prueba', message: "Primera prueba de pdf enviada por correo" });
    
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
                content: Buffer.from(pdfBuffer),
                contentType: 'application/pdf',
            },
        ],
    };

    try {
        const info = await transporter.sendMail(mailOptions);
        console.log('Correo enviado: %s', info.messageId);

        res.json({
            ok: true
        });

    } catch (error) {
        console.error('Error al enviar el correo:', error);
    }
};

export {
    sendEmail,
    sendEmailWithPDF
}
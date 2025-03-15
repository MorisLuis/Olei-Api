import { NextFunction, Request, Response } from 'express';
import nodemailer from 'nodemailer';
import { generatePDF } from '../utils/generatePDF';
import { emailBodySchema, emailCobranzaBodySchema } from '../validations/emailValidations';
import { Buffer } from 'buffer';  // Importa Buffer si es necesario

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


const sendEmail = async (req: Request, res: Response, next: NextFunction) : Promise<Response | void> => {

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

        return res.json({
            ok: true
        });

    } catch (error) {
        return next(error)
    }
};

const sendEmailWithPDF = async (req: Request, res: Response, next: NextFunction) : Promise<Response | void> => {

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
        await transporter.sendMail(mailOptions);
        //const info = await transporter.sendMail(mailOptions);
        //console.log('Correo enviado: %s', info.messageId);

        return res.json({
            ok: true
        });

    } catch (error) {
        return next(error)
    }
};

export {
    sendEmail,
    sendEmailWithPDF
}
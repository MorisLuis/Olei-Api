import { NextFunction, Request, Response } from 'express';
import nodemailer from 'nodemailer';


export const sendEmail = async (req: Request, res: Response, next: NextFunction) => {

    const { 
        destinatario,
        remitente,
        subject,
        text
    } = req.body

    // Configurar el transporte SMTP
    const transporter = nodemailer.createTransport({
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

    } catch (error) {
        console.error('Error al enviar el correo:', error);
    }
};
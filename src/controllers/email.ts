import type { NextFunction, Request, Response } from 'express';
import nodemailer from 'nodemailer';
import { emailBodySchema, emailCobranzaBodySchema } from '../validations/emailValidations';
import { getClientParamsSchema } from '../validations/sellsValidations';
import { getCobranzaByClientQuerySchema } from '../validations/cobranzaValidations';
import { sendEmailWithPDFService } from '../services/email/emailService';

// Configurar el transporte SMTP
export const transporter = nodemailer.createTransport({
    host: 'smtp.gmail.com',
    port: 465,
    secure: true,
    auth: {
        user: 'moradoluisenrique@gmail.com', // Tu usuario SMTP
        pass: process.env.KEY_EMAIL, // Tu contraseña SMTP
    },
});


const sendEmail = async (req: Request, res: Response, next: NextFunction): Promise<Response | void> => {

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

const sendEmailWithPDF = async (req: Request, res: Response, next: NextFunction): Promise<Response | void> => {

    const { destinatario, remitente, subject, text, nombreRemitente } = emailCobranzaBodySchema.parse(req.body);
    const queryRequest = { ...req.query, Id_Almacen: '0' };

    const {
        PageNumber,
        cobranzaOrderCondition,
        TipoDoc,
        FilterExpired,
        FilterNotExpired,
        DateEnd,
        DateExactly,
        DateStart
    } = getCobranzaByClientQuerySchema.parse(queryRequest);
    const { client } = getClientParamsSchema.parse(req.params);
    const userSession = req.sessionWeb;

    const mailOptions = await sendEmailWithPDFService({
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
    })

    try {
        await transporter.sendMail(mailOptions);

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
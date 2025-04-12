import type { NextFunction, Request, Response } from 'express';
import nodemailer from 'nodemailer';
import { emailBodySchema, emailCobranzaBodySchema } from '../validations/emailValidations';
import { Buffer } from 'buffer';  // Importa Buffer si es necesario
import { getClientParamsSchema, getCobranzaQuerySchema } from '../validations/sellsValidations';
import { getAllCobranzaService } from '../services/cobranzaService';
import generatePDF from '../utils/generatePDF';

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

    const {
        destinatario,
        remitente,
        subject,
        text,
        nombreRemitente
    } = emailCobranzaBodySchema.parse(req.body);

    const {
        PageNumber,
        sellsOrderCondition,
        FilterTipoDoc,
        TipoDoc,
        FilterExpired,
        FilterNotExpired,
        DateEnd,
        DateExactly,
        DateStart
    } = getCobranzaQuerySchema.parse(req.query);


    const { client } = getClientParamsSchema.parse(req.params);

    const userSession = req.sessionWeb;

    const { sells, brief } = await getAllCobranzaService({
        userSession,
        Id_Cliente: client,
        PageNumber: PageNumber || 1,
        SellsOrderCondition: sellsOrderCondition,
        TipoDoc,
        FilterTipoDoc,
        FilterNotExpired,
        FilterExpired,
        DateEnd: DateEnd || null,
        DateExactly: DateExactly || null,
        DateStart: DateStart || null,
        PageSize: 100
    });

    const pdfBuffer = await generatePDF(sells, brief);

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

        return res.json({
            ok: true
        });

    } catch (error) {
        console.log({ error })
        return next(error)
    }
};

export {
    sendEmail,
    sendEmailWithPDF
}
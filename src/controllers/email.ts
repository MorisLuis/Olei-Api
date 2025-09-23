import type { NextFunction, Request, Response } from 'express';
import { emailBodySchema, emailCobranzaBodySchema } from '../validations/emailValidations';
import { getClientParamsSchema } from '../validations/sellsValidations';
import { getCobranzaByClientQuerySchema } from '../validations/cobranzaValidations';
import { sendEmailService, sendEmailWithPDFService } from '../services/email/emailService';
import { handleTransporter } from '../infra/email/transporter';


const sendEmail = async (req: Request, res: Response, next: NextFunction): Promise<Response | void> => {

    const { destinatario, remitente, subject, text } = emailBodySchema.parse(req.body)
    const userSession = req.sessionWeb;

    const { emailTransporterData, mailOptions } = await sendEmailService({
        destinatario,
        remitente,
        subject,
        text,
        userSession
    })

    try {
        await handleTransporter({
            host: "smtp.gmail.com",
            port: 465,
            secure: true,
            auth: { user: "moradoluisenrique@gmail.com", pass: 'gcnx sjih fxcq drcy' }
        }).sendMail(mailOptions)

        return res.json({
            ok: true
        });

    } catch (error) {
        return next(error)
    }
};


/**
 * Controller to send a cobranza email with a PDF attachment.
 * Validates request body and query parameters using Zod schemas,
 * then triggers the email service and responds with JSON.
 */

const sendEmailWithPDF = async (req: Request, res: Response, next: NextFunction): Promise<Response | void> => {

    const { destinatario, remitente, subject, text, nombreRemitente, Id_Almacen: Id_Almacen_Client } = emailCobranzaBodySchema.parse(req.body);

    // Add the Id_Almacen_Client to te query, to comply with 'getCobranzaByClientQuerySchema' schema zod.
    const queryRequest = { ...req.query, Id_Almacen: Id_Almacen_Client };
    const { PageNumber, cobranzaOrderCondition, TipoDoc, FilterExpired, FilterNotExpired, DateEnd, DateExactly, DateStart, Id_Almacen } = getCobranzaByClientQuerySchema.parse(queryRequest);

    const { client: Id_Cliente } = getClientParamsSchema.parse(req.params);
    const userSession = req.sessionWeb;

    try {
        const { mailOptions, emailTransporterData } = await sendEmailWithPDFService({
            Id_Cliente,
            Id_Almacen,
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
        });

        await handleTransporter({
            host: "smtp.gmail.com",
            port: 465,
            secure: true,
            auth: { user: "moradoluisenrique@gmail.com", pass: 'gcnx sjih fxcq drcy' }
        }).sendMail(mailOptions)
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
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
        await handleTransporter(emailTransporterData).sendMail(mailOptions)

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
    const { PageNumber, cobranzaOrderCondition, TipoDoc, FilterExpired, FilterNotExpired, DateEnd, DateExactly, DateStart } = getCobranzaByClientQuerySchema.parse(queryRequest);
    const { client } = getClientParamsSchema.parse(req.params);
    const userSession = req.sessionWeb;

    try {
        const { mailOptions, emailTransporterData } = await sendEmailWithPDFService({
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
        });

        await handleTransporter(emailTransporterData).sendMail(mailOptions)
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
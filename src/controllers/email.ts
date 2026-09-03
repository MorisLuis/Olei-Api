import type { NextFunction, Request, Response } from 'express';
import { emailBodySchema, emailCobranzaBodySchema } from '../validations/emailValidations';
import { getClientParamsSchema } from '../validations/sellsValidations';
import { getCobranzaByClientQuerySchema } from '../validations/cobranzaValidations';
import { sendEmailService, sendEmailWithPDFService } from '../services/email/emailService';
import { handleTransporter } from '../infra/email/transporter';


/** @description Sends a CRM email using validated message data and the tenant's email configuration.
 * @client CRM
 * @router POST /api/email
 * @request Validated recipient, sender, subject, and text body fields; requires the CRM web tenant session.
 * @response JSON with the email service result; validation and delivery failures are forwarded to `next`.
 */
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


/** 
 * @description Sends a CRM receivables email with a generated PDF attachment.
 * @client CRM
 * @router POST /api/email/cobranza/pdf/:client and POST /api/email/cobranza/excell
 * @request Validated message data plus route/query receivables context; requires the CRM web tenant session.
 * @response JSON with the email service result; validation, report, and delivery failures are forwarded to `next`.
 */
const sendEmailWithPDF = async (req: Request, res: Response, next: NextFunction): Promise<Response | void> => {
    try {
        const { destinatario, remitente, subject, text, nombreRemitente, Id_Almacen: Id_Almacen_Client } = emailCobranzaBodySchema.parse(req.body);
        const queryRequest = { ...req.query, Id_Almacen: Id_Almacen_Client };
        const { PageNumber, cobranzaOrderCondition, TipoDoc, FilterExpired, FilterNotExpired, DateEnd, DateExactly, DateStart, Id_Almacen } = getCobranzaByClientQuerySchema.parse(queryRequest);
    
        const { client: Id_Cliente } = getClientParamsSchema.parse(req.params);
        const userSession = req.sessionWeb;
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

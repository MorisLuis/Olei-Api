"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.sendEmailWithPDF = exports.sendEmail = void 0;
const emailValidations_1 = require("../validations/emailValidations");
const sellsValidations_1 = require("../validations/sellsValidations");
const cobranzaValidations_1 = require("../validations/cobranzaValidations");
const emailService_1 = require("../services/email/emailService");
const transporter_1 = require("../infra/email/transporter");
const sendEmail = async (req, res, next) => {
    const { destinatario, remitente, subject, text } = emailValidations_1.emailBodySchema.parse(req.body);
    const userSession = req.sessionWeb;
    const { emailTransporterData, mailOptions } = await (0, emailService_1.sendEmailService)({
        destinatario,
        remitente,
        subject,
        text,
        userSession
    });
    try {
        /* await handleTransporter({
            host: "smtp.gmail.com",
            port: 465,
            secure: true,
            auth: { user: "moradoluisenrique@gmail.com", pass: 'gcnx sjih fxcq drcy' }
        }).sendMail(mailOptions) */
        await (0, transporter_1.handleTransporter)(emailTransporterData).sendMail(mailOptions);
        return res.json({
            ok: true
        });
    }
    catch (error) {
        return next(error);
    }
};
exports.sendEmail = sendEmail;
/**
 * Controller to send a cobranza email with a PDF attachment.
 * Validates request body and query parameters using Zod schemas,
 * then triggers the email service and responds with JSON.
 */
const sendEmailWithPDF = async (req, res, next) => {
    const { destinatario, remitente, subject, text, nombreRemitente, Id_Almacen: Id_Almacen_Client } = emailValidations_1.emailCobranzaBodySchema.parse(req.body);
    // Add the Id_Almacen_Client to te query, to comply with 'getCobranzaByClientQuerySchema' schema zod.
    const queryRequest = { ...req.query, Id_Almacen: Id_Almacen_Client };
    const { PageNumber, cobranzaOrderCondition, TipoDoc, FilterExpired, FilterNotExpired, DateEnd, DateExactly, DateStart, Id_Almacen } = cobranzaValidations_1.getCobranzaByClientQuerySchema.parse(queryRequest);
    const { client: Id_Cliente } = sellsValidations_1.getClientParamsSchema.parse(req.params);
    const userSession = req.sessionWeb;
    try {
        const { mailOptions, emailTransporterData } = await (0, emailService_1.sendEmailWithPDFService)({
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
        await (0, transporter_1.handleTransporter)(emailTransporterData).sendMail(mailOptions);
        return res.json({
            ok: true
        });
    }
    catch (error) {
        return next(error);
    }
};
exports.sendEmailWithPDF = sendEmailWithPDF;
//# sourceMappingURL=email.js.map
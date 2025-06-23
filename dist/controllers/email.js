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
        await (0, transporter_1.handleTransporter)(emailTransporterData).sendMail(mailOptions);
        return res.json({
            ok: true
        });
    }
    catch (error) {
        console.log({ error });
        return next(error);
    }
};
exports.sendEmail = sendEmail;
const sendEmailWithPDF = async (req, res, next) => {
    const { destinatario, remitente, subject, text, nombreRemitente } = emailValidations_1.emailCobranzaBodySchema.parse(req.body);
    const queryRequest = { ...req.query, Id_Almacen: '0' };
    const { PageNumber, cobranzaOrderCondition, TipoDoc, FilterExpired, FilterNotExpired, DateEnd, DateExactly, DateStart } = cobranzaValidations_1.getCobranzaByClientQuerySchema.parse(queryRequest);
    const { client } = sellsValidations_1.getClientParamsSchema.parse(req.params);
    const userSession = req.sessionWeb;
    try {
        const { mailOptions, emailTransporterData } = await (0, emailService_1.sendEmailWithPDFService)({
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
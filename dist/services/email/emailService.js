"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.sendEmailWithPDFService = exports.sendEmailService = void 0;
const database_1 = require("../../database");
const email_1 = require("../../database/querys/email");
const CustomError_1 = require("../../errors/CustomError");
const generatePDF_1 = __importDefault(require("../../utils/generatePDF"));
const cobranza_utils_1 = require("../cobranza/cobranza.utils");
const sendEmailService = async ({ destinatario, remitente, subject, text, userSession }) => {
    const { ServidorSQL, BaseSQL, Id_UsuarioOLEI } = userSession;
    const userEmailData = await getUserEmailConfig(Id_UsuarioOLEI, {
        ServidorSQL,
        BaseSQL
    });
    if (!remitente || !destinatario) {
        throw new CustomError_1.ValidationError('Es necesario remitente y destinatario.');
    }
    const mailOptions = {
        from: `"Olei Software" <${remitente}>`,
        to: destinatario,
        subject: subject,
        text: text,
        replyTo: remitente
    };
    if (!userEmailData.SMTPHost?.trim() ||
        !userEmailData.SMTPPuerto ||
        !userEmailData.MailUsuario?.trim() ||
        !userEmailData.MailPassword?.trim()) {
        throw new CustomError_1.ValidationError('Es necesario toda la información para enviar correo, consulta con el proveedor.');
    }
    const emailTransporterData = {
        host: userEmailData.SMTPHost.trim(),
        port: userEmailData.SMTPPuerto,
        secure: true,
        auth: {
            user: userEmailData.MailUsuario.trim(),
            pass: userEmailData.MailPassword.trim()
        }
    };
    return {
        emailTransporterData,
        mailOptions
    };
};
exports.sendEmailService = sendEmailService;
const sendEmailWithPDFService = async ({ Id_Cliente, TipoDoc, FilterExpired, FilterNotExpired, DateEnd, DateExactly, DateStart, PageNumber, SellsOrderCondition, userSession, destinatario, remitente, subject, text, nombreRemitente }) => {
    const { ServidorSQL, BaseSQL, Id_UsuarioOLEI } = userSession;
    const { sells, brief } = await (0, cobranza_utils_1.getAllCobranzaService)({
        Id_Almacen: userSession.Id_Almacen,
        userSession,
        Id_Cliente,
        PageNumber: PageNumber || 1,
        SellsOrderCondition,
        TipoDoc,
        FilterNotExpired,
        FilterExpired,
        DateEnd: DateEnd || null,
        DateExactly: DateExactly || null,
        DateStart: DateStart || null,
        PageSize: 10
    });
    const pdfBuffer = await (0, generatePDF_1.default)(sells, brief);
    const userEmailData = await getUserEmailConfig(Id_UsuarioOLEI, {
        ServidorSQL,
        BaseSQL
    });
    if (!remitente || !destinatario) {
        throw new CustomError_1.ValidationError('Es necesario remitente y destinatario.');
    }
    ;
    const mailOptions = {
        from: `"Olei Software" <${remitente}>`,
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
    if (!userEmailData.SMTPHost?.trim() ||
        !userEmailData.SMTPPuerto ||
        !userEmailData.MailUsuario?.trim() ||
        !userEmailData.MailPassword?.trim()) {
        throw new CustomError_1.ValidationError('Es necesario toda la información para enviar correo, consulta con el proveedor.');
    }
    const emailTransporterData = {
        host: userEmailData.SMTPHost.trim(),
        port: userEmailData.SMTPPuerto,
        secure: true,
        auth: {
            user: userEmailData.MailUsuario.trim(),
            pass: userEmailData.MailPassword.trim()
        }
    };
    return {
        mailOptions,
        emailTransporterData
    };
};
exports.sendEmailWithPDFService = sendEmailWithPDFService;
const getUserEmailConfig = async (Id_UsuarioOLEI, dbConfig) => {
    const pool = await (0, database_1.dbConnectionWeb)(dbConfig.ServidorSQL, dbConfig.BaseSQL);
    const userRequest = await pool
        .request()
        .input('Id_Usuario', Id_UsuarioOLEI)
        .query(email_1.EmailQuery.getUserEmailData);
    return userRequest.recordset[0];
};
//# sourceMappingURL=emailService.js.map
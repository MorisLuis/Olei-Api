import { dbConnectionWeb } from "../../database";
import { EmailQuery } from "../../database/querys/email";
import { ValidationError } from "../../errors/CustomError";
import type { Transporter } from "../../infra/email/transporter";
import type { UserEmailDataInterface } from "../../interface/email";
import generatePDF from "../../utils/pdf/generatePDF";
import { getAllCobranzaService } from "../cobranza/cobranza.utils";
import type { SendEmailResponse, MailOptionsInterface, SendEmailServiceParams, SendEmailWithPDFServiceParams } from "./email.interface";
import { Buffer } from 'buffer';

interface DBConfig {
    ServidorSQL: string;
    BaseSQL: string;
}

const sendEmailService = async ({
    destinatario,
    remitente,
    subject,
    text,
    userSession
}: SendEmailServiceParams): Promise<SendEmailResponse> => {

    const { ServidorSQL, BaseSQL, Id_UsuarioOLEI } = userSession;

    const userEmailData = await getUserEmailConfig(Id_UsuarioOLEI, {
        ServidorSQL,
        BaseSQL
    });

    if (!remitente || !destinatario) {
        throw new ValidationError('Es necesario remitente y destinatario.');
    }


    if (
        !userEmailData.SMTPHost?.trim() ||
        !userEmailData.SMTPPuerto ||
        !userEmailData.MailUsuario?.trim() ||
        !userEmailData.MailPassword?.trim()
    ) {
        throw new ValidationError('Es necesario toda la información para enviar correo, consulta con el proveedor.');
    }

    const mailOptions: MailOptionsInterface = {
        from: `"Olei Software" <${userEmailData.MailUsuario}>`,
        to: destinatario,
        subject: subject,
        text: text,
        replyTo: remitente
    };

    const emailTransporterData: Transporter = {
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
    }
}

const sendEmailWithPDFService = async ({
    Id_Cliente,
    TipoDoc,
    FilterExpired,
    FilterNotExpired,
    DateEnd,
    DateExactly,
    DateStart,
    PageNumber,
    SellsOrderCondition,
    userSession,
    destinatario,
    remitente,
    subject,
    text,
    nombreRemitente
}: SendEmailWithPDFServiceParams): Promise<SendEmailResponse> => {

    const { ServidorSQL, BaseSQL, Id_UsuarioOLEI } = userSession;

    const { sells, brief } = await getAllCobranzaService({
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

    const pdfBuffer = await generatePDF(sells, brief);

    const userEmailData = await getUserEmailConfig(Id_UsuarioOLEI, {
        ServidorSQL,
        BaseSQL
    });

    if (!remitente || !destinatario) {
        throw new ValidationError('Es necesario remitente y destinatario.');
    };

    if (
        !userEmailData.SMTPHost?.trim() ||
        !userEmailData.SMTPPuerto ||
        !userEmailData.MailUsuario?.trim() ||
        !userEmailData.MailPassword?.trim()
    ) {
        throw new ValidationError('Es necesario toda la información para enviar correo, consulta con el proveedor.');
    };

    const mailOptions: MailOptionsInterface = {
        from: `"Olei Software" <${userEmailData.MailUsuario}>`,
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

    const emailTransporterData: Transporter = {
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

const getUserEmailConfig = async (Id_UsuarioOLEI: string, dbConfig: DBConfig): Promise<UserEmailDataInterface> => {
    try {
        const pool = await dbConnectionWeb(dbConfig.ServidorSQL, dbConfig.BaseSQL);
        const userRequest = await pool.request().input('Id_Usuario', Id_UsuarioOLEI).query(EmailQuery.getUserEmailData);
        return userRequest.recordset[0];
    } catch (error) {
        console.error('Error fetching user email config:', error);
        throw new Error('Failed to get user email config');
    }
};

export {
    sendEmailService,
    sendEmailWithPDFService,
    getUserEmailConfig
}
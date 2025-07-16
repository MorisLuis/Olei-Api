import type { Transporter } from "../../infra/email/transporter";
import type { SellsInterface, SellsOrderConditionByClientType } from "../../interface/sells";
import type { UserWebSessionInterface } from "../../interface/user";
import type { FilterType } from "../cobranza/cobranza.interface";
import type { Buffer } from 'buffer';

interface SendEmailServiceParams {
    destinatario: string,
    remitente: string,
    subject: string,
    text: string,
    userSession: UserWebSessionInterface;
};

interface SendEmailWithPDFServiceParams {
    userSession: UserWebSessionInterface;
    
    // Cobranza params
    Id_Cliente: number;
    Id_Almacen: number;
    PageNumber: number;
    TipoDoc: SellsInterface['TipoDoc']
    FilterExpired: FilterType,
    FilterNotExpired: FilterType,
    DateEnd?: string,
    DateExactly?: string,
    DateStart?: string,
    SellsOrderCondition: SellsOrderConditionByClientType | string;

    // Email data
    destinatario: string,
    remitente: string,
    subject: string,
    text: string,
    nombreRemitente: string
};

interface SendEmailResponse {
    mailOptions: MailOptionsInterface;
    emailTransporterData: Transporter;
};

interface MailOptionsInterface {
    from: string;
    to: string;
    subject: string;
    text: string;
    replyTo: string;
    attachments?: [
        {
            filename: string;
            content: Buffer;
            contentType: 'application/pdf'
        }
    ]
};

export type {
    SendEmailServiceParams,
    SendEmailWithPDFServiceParams,
    SendEmailResponse,

    MailOptionsInterface
}
import type { SellsInterface, SellsOrderConditionByClientType } from "../../interface/sells";
import type { UserWebSessionInterface } from "../../interface/user";
import type { FilterType } from "../cobranza/cobranza.interface";


interface SendEmailWithPDFServiceInterface {

    Id_Cliente: number;
    PageNumber: number;
    TipoDoc: SellsInterface['TipoDoc']
    FilterExpired: FilterType,
    FilterNotExpired: FilterType,
    DateEnd?: string,
    DateExactly?: string,
    DateStart?: string,
    SellsOrderCondition: SellsOrderConditionByClientType | string;
    userSession: UserWebSessionInterface;

    destinatario: string,
    remitente: string,
    subject: string,
    text: string,
    nombreRemitente: string

};

interface MailOptionsInterface {
    from: string;
    to: string;
    subject: string;
    text: string;
    replyTo: string;
    attachments: [
        {
            filename: string;
            content:  Buffer;
            contentType: 'application/pdf'
        }
    ]
}


export type {
    SendEmailWithPDFServiceInterface,
    MailOptionsInterface
}
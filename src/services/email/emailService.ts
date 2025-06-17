import generatePDF from "../../utils/generatePDF";
import { getAllCobranzaService } from "../cobranza/cobranza.utils";
import type { MailOptionsInterface, SendEmailWithPDFServiceInterface } from "./email.interface";

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
}: SendEmailWithPDFServiceInterface ) : Promise<MailOptionsInterface> => {

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

    const mailOptions : MailOptionsInterface = {
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

    return mailOptions;
};

export {
    sendEmailWithPDFService
}
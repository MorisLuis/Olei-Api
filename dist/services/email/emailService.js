"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.sendEmailWithPDFService = void 0;
const generatePDF_1 = __importDefault(require("../../utils/generatePDF"));
const cobranza_utils_1 = require("../cobranza/cobranza.utils");
const sendEmailWithPDFService = async ({ Id_Cliente, TipoDoc, FilterExpired, FilterNotExpired, DateEnd, DateExactly, DateStart, PageNumber, SellsOrderCondition, userSession, destinatario, remitente, subject, text, nombreRemitente }) => {
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
    const mailOptions = {
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
exports.sendEmailWithPDFService = sendEmailWithPDFService;
//# sourceMappingURL=emailService.js.map
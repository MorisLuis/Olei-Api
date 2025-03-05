import { NextFunction, Request, Response } from 'express';
import nodemailer from 'nodemailer';
import { generatePDF } from '../utils/generatePDF';
import { emailBodySchema, emailCobranzaBodySchema } from '../validations/emailValidations';
import { getCobranzaService } from '../services/sellsDocsServices';
import { getClientParamsSchema, getCobranzaQuerySchema } from '../validations/sellsValidations';

// Configurar el transporte SMTP
const transporter = nodemailer.createTransport({
    host: 'smtp.gmail.com',
    port: 465,
    secure: true,
    auth: {
        user: 'moradoluisenrique@gmail.com', // Tu usuario SMTP
        pass: process.env.KEY_EMAIL, // Tu contraseña SMTP
    },
});


const sendEmail = async (req: Request, res: Response, next: NextFunction) => {

    const { destinatario, remitente, subject, text } = emailBodySchema.parse(req.body)

    // Opciones del correo
    const mailOptions = {
        from: '"Olei Software" <moradoluisenrique@gmail.com>',
        to: destinatario,
        subject: subject,
        text: text,
        replyTo: remitente
    };

    try {
        await transporter.sendMail(mailOptions);

        res.json({
            ok: true
        });

    } catch (error) {
        next(error)
    }
};

const sendEmailWithPDF = async (req: Request, res: Response, next: NextFunction) => {

    const { destinatario, remitente, subject, text, nombreRemitente } = emailCobranzaBodySchema.parse(req.body)
    const { PageNumber, sellsOrderCondition, FilterTipoDoc, TipoDoc, FilterExpired, FilterNotExpired, DateEnd, DateExactly, DateStart } = getCobranzaQuerySchema.parse(req.query);
    const { client } = getClientParamsSchema.parse(req.params);
    const sessionId = req.sessionRedis;

    // Obtener la primera página de datos
    let allSells: any = [];
    let page = PageNumber || 1;
    let sells;

    do {
        // Llamada al servicio para obtener los datos de la página actual
        sells = await getCobranzaService({
            sessionId,
            Id_Cliente: client,
            PageNumber: page,
            SellsOrderCondition: sellsOrderCondition,
            TipoDoc,
            FilterTipoDoc,
            FilterNotExpired,
            FilterExpired,
            DateEnd: DateEnd || null,
            DateExactly: DateExactly || null,
            DateStart: DateStart || null
        });

        // Concatenar los datos de la página actual a todos los resultados
        allSells = allSells.concat(sells);

        console.log("proccessing....")
        console.log("Datos actuales", sells.length)
        console.log("Datos procesados", allSells.length)
        console.log({page})
        // Incrementar el número de página
        page++;

        // Aquí podrías agregar una condición para salir del bucle si no hay más datos
    } while (sells.length > 0); // Se sigue obteniendo mientras haya datos en la respuesta

    console.log('elementos procesados', allSells.length);

    // Generar el PDF con todos los elementos obtenidos
    const pdfBuffer = await generatePDF(allSells);

    // Opciones del correo
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

    try {
        const info = await transporter.sendMail(mailOptions);
        console.log('Correo enviado: %s', info.messageId);

        res.json({
            ok: true
        });

    } catch (error) {
        console.error('Error al enviar el correo:', error);
        res.status(500).json({ error: 'Error al enviar el correo' });
    }
};


export {
    sendEmail,
    sendEmailWithPDF
}
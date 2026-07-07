
import nodemailer from 'nodemailer';
import type SMTPTransport from 'nodemailer/lib/smtp-transport';

export interface Transporter {
    host: string;
    port: number;
    secure: boolean;
    auth: {
        user: string;
        pass?: string;
    }
};

export const transportDefault: Transporter = {
    host: 'mail.oleisoftware.com.mx',
    port: 465,
    secure: true,
    auth: {
        user: 'idaliahc@oleisoftware.com.mx', // Tu usuario SMTP
        pass: 'Anaregina24.', // Tu contraseña SMTP
    }
};


const handleTransporter = (values: Transporter): nodemailer.Transporter<SMTPTransport.SentMessageInfo, SMTPTransport.Options> => {
    return nodemailer.createTransport({
        host: values.host,
        port: values.port,
        secure: values.secure,
        auth: {
            user: values.auth.user, // Tu usuario SMTP
            pass: values.auth.pass, // Tu contraseña SMTP
        },
    });
}

export {
    handleTransporter
}
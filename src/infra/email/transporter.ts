
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

const handleTransporter = (values: Transporter): nodemailer.Transporter<SMTPTransport.SentMessageInfo, SMTPTransport.Options> => {
    return nodemailer.createTransport({
        host: values.host,
        port: values.port,
        secure: values.secure,
        auth: {
            user: values.auth.user,
            pass: values.auth.pass,
        },
    });
}

export {
    handleTransporter
}

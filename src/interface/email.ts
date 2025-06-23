

interface UserEmailDataInterface {
    Id_Usuario: string,
    MailUsuario: string,
    MailPassword: string,
    SMTPHost: string,
    SMTPPuerto: number,
    SMTPSSL: boolean,
    SMTPAuth: boolean
};

export type {
    UserEmailDataInterface
}
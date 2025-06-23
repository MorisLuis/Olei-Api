export const EmailQuery = {

    getUserEmailData : `
        SELECT
            Id_Usuario,
            MailUsuario,
            MailPassword,
            SMTPHost,
            SMTPPuerto,
            SMTPSSL,
            SMTPAut
        FROM [dbo].[USUARIOS]
        WHERE Id_Usuario = @Id_Usuario
    `
}
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.EmailQuery = void 0;
exports.EmailQuery = {
    getUserEmailData: `
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
};
//# sourceMappingURL=email.js.map
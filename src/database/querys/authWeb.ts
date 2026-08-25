

export const authWebQuery = {
    authWeb: ` 
        SELECT 
            U.ServidorSQL,
            U.BaseSQL,
            U.Id_UsuarioOOL,
            U.PasswordOOL,
            U.Id_UsuarioOLEI,
            U.PasswordOLEI,
            U.TipoUsuario,
            U.Id_Cliente,
            U.Id_Almacen,
            UC.SwImagenes, 
            UC.SwSinStock, 
            UC.SwsinPrecio, 
            UC.TipoDocOO, 
            UC.IdOLEI,
            UC.Nombre,
            UC.Vigencia,
            UC.UsuarioSQL,
            UC.Id_ListPre,
            PU.InformesIAR,
            PU.InformesIAE,
            PU.InformesIAW
        FROM [OLEIDB1_CLIENTES].[dbo].[USUARIOSOOL] U
        JOIN [OLEIDB1_CLIENTES].[dbo].[CLIENTES] UC on U.Id_ClienteDBCLIENTES = UC.Id_Cliente
        JOIN [OLEIDB1_CLIENTES].[dbo].[PERFILESUSUARIO] PU on PU.Id_Perfil = U.Id_Perfil
        WHERE U.Id_UsuarioOOL = @email
    `,

    authDatabase: `
        SELECT 
            IdOLEI,
            PasswordOLEI,
            IdUsuarioOLEI,
            ServidorSQL,
            BaseSQL,
            UsuarioSQL,
            PasswordSQL,
            RazonSocial,
            SwImagenes,
            Vigencia,
            Id_ListPre
        FROM [dbo].[CLIENTES]
        WHERE IdUsuarioOLEI = @IdUsuarioOLEI
    `,
}

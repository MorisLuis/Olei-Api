export const querys = {

    //Auth
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
            UC.Id_ListPre
        FROM [OLEIDB1_CLIENTES].[dbo].[USUARIOSOOL] U
        JOIN [OLEIDB1_CLIENTES].[dbo].[CLIENTES] UC on U.Id_ClienteDBCLIENTES = UC.Id_Cliente
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
            Vigencia
        FROM [dbo].[CLIENTES]
        WHERE IdUsuarioOLEI = @IdUsuarioOLEI
    `,

    // Tables
    getFamilias: `
        SELECT TOP(10)
        TRIM(Nombre) AS Nombre  
        FROM [dbo].[FAMILIAS]
        WHERE LOWER(Nombre) LIKE '%' + LOWER(@Nombre) + '%'
        ORDER BY 
        CASE 
            WHEN LOWER(Nombre) LIKE LOWER(@Nombre) + '%' THEN 0 -- Prioridad para coincidencia inicial
            ELSE 1
        END,
        Nombre; -- Luego orden alfabético
    `,

    getMarcas: `
        SELECT TOP(10)
        TRIM(Nombre) AS Nombre  
        FROM [dbo].[MARCAS]
        WHERE LOWER(Nombre) LIKE '%' + LOWER(@Nombre) + '%'
        ORDER BY 
        CASE 
            WHEN LOWER(Nombre) LIKE LOWER(@Nombre) + '%' THEN 0 -- Prioridad para coincidencia inicial
            ELSE 1
        END,
        Nombre; -- Luego orden alfabético
    `,

    getFolios: `
        SELECT TOP(10)
        TRIM(Codigo) AS Codigo
        FROM [dbo].[PRODUCTOS]
        WHERE LOWER(Codigo) LIKE '%' + LOWER(@Codigo) + '%'
        ORDER BY 
        CASE 
            WHEN LOWER(Codigo) LIKE LOWER(@Codigo) + '%' THEN 0 -- Prioridad para coincidencia inicial
            ELSE 1
        END,
        Codigo; -- Luego orden alfabético
    `,

    postError: `
        INSERT INTO [dbo].[ERRORES]
        ( [From], [Message], Id_Usuario, Fecha, Metodo, code )
        VALUES
        ( @From, @Message, @Id_Usuario, @Fecha, @Metodo, @code )
    `
}
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.querys = void 0;
exports.querys = {
    //Auth
    getAuthLimitData: `
        SELECT 
            Id_Almacen,
            ActualizarListas AS Id_ListPre
        FROM [dbo].[USUARIOS]
        WHERE Id_Usuario = @Id_Usuario
    `,
    authWeb: ` 
        SELECT 
            U.Id_UsuarioOOL,
            U.PasswordOOL,
            U.ServidorSQL,
            U.BaseSQL,
            U.TipoUsuario,
            U.Id_UsuarioOLEI,
            U.PasswordOLEI,
            U.Id_ClienteDBCLIENTES,
            U.Id_Almacen,
            U.Id_Cliente,
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
        SELECT [IdOLEI]
            ,[Id_Almacen]
            ,[Id_Cliente]
            ,[Nombre]
            ,[Id_ListPre]
            ,[IdUsuarioOLEI]
            ,[PasswordOLEI]
            ,[ServidorSQL]
            ,[BaseSQL]
            ,[UsuarioSQL]
            ,[PasswordSQL]
            ,[Vigencia]
            ,[RazonSocial]
            ,[SwImagenes]
            ,[SwSinStock]
            ,[SwSinPrecio]
            ,[TipoDocOO]
        FROM [dbo].[CLIENTES]
        WHERE IdUsuarioOLEI = @IdUsuarioOLEI
    `,
    // Tables
    getFamilias: `SELECT TRIM(F.Nombre) AS Nombre FROM [dbo].[FAMILIAS] F`,
    getMarcas: `SELECT TRIM(M.Nombre) AS Nombre FROM [dbo].[MARCAS] M`,
    getFolios: `SELECT TRIM(P.Codigo) AS Codigo FROM [dbo].[PRODUCTOS] P`,
    // TypeOfMovements
    getTiposMovimiento: `
        SELECT TOP (1000) 
            [Id_TipoMovInv],
            [Descripcion],
            [Accion],
            [Id_AlmDest]
        FROM [dbo].[TIPOMOVSINV]
    `,
    getTipoDeMovimiento: `
        SELECT 
            [Id_TipoMovInv],
            [Descripcion],
            [Accion],
            [Id_AlmDest]
        FROM [dbo].[TIPOMOVSINV]
        WHERE Id_TipoMovInv = @Id_TipoMovInv
    `,
    postError: `
        INSERT INTO [dbo].[ERRORES]
        ( [From], [Message], Id_Usuario, Fecha, Metodo, code )
        VALUES
        ( @From, @Message, @Id_Usuario, GETDATE(), @Metodo, @code )
    `
};
//# sourceMappingURL=querys.js.map
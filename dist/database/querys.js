"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.querys = void 0;
exports.querys = {
    //Auth
    auth: ` 
        SELECT
        [Nombre],
        [EMail],
        [Id_Usuario],
        [Password],
        [Id_Almacen]
        FROM [dbo].[USUARIOS]
        WHERE Id_Usuario = @Id_Usuario
    `,
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
    authCompany: ` 
        SELECT C.Id_ListPre, C.Nombre, CS.PrecioIncIVA
        FROM [dbo].[CLIENTES] C
        JOIN [dbo].[CONFIGSIST] CS ON C.IdOLEI = @IdOLEI
        WHERE Id_Cliente = @Id_Cliente
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
    getTypeOfMovementInitial: `
        SELECT TOP (1) 
            [Id_TipoMovInv],
            [Descripcion],
            [Accion],
            [Id_AlmDest]
        FROM [dbo].[TIPOMOVSINV]
    `,
    // Users
    getAllUsers: "SELECT TOP(500) * FROM [OLEIDB1_CLIENTES].[dbo].[USUARIOS]",
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
    // Clients
    getClientBySearch: `
        SELECT TOP(10) 
            TRIM(C.Nombre) AS Nombre, 
            C.Id_Cliente,
            C.Id_Almacen, 
            C.Id_ListPre, 
            C.CorreoVtas, 
            C.Telefono1
        FROM [dbo].[CLIENTES] C
        WHERE LOWER(C.Nombre) LIKE '%' + LOWER(@nombre) + '%'
    `,
    postError: `
        INSERT INTO [dbo].[ERRORES]
        ( [From], [Message], Id_Usuario, Fecha, Metodo, code )
        VALUES
        ( @From, @Message, @Id_Usuario, GETDATE(), @Metodo, @code )
    `
};
//# sourceMappingURL=querys.js.map
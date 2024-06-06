"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.querys = void 0;
exports.querys = {
    //Auth
    auth: ` 
        SELECT *
        FROM [dbo].[USUARIOS]
        WHERE Id_Usuario = @Id_Usuario
    `,
    authWeb: ` 
        SELECT U.*, UC.SwImagenes, UC.SwSinStock, UC.SwsinPrecio, UC.TipoDocOO, UC.IdOLEI,
        TRIM(UC.Nombre) AS Company
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
    getUser: "SELECT * FROM [OLEIDB1_CLIENTES].[dbo].[USUARIOS] WHERE Nombre = ?",
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
        SELECT TOP(20) TRIM(C.Nombre) AS Nombre, C.Id_Cliente, C.Id_Almacen, C.Id_ListPre
        FROM [dbo].[CLIENTES] C
    `,
    // ...
    updateExistenceTable: (updateValue, difference) => {
        return ` 
            DECLARE @UpdatedData TABLE (
                Id_Almacen INT,
                ExistenciaAnt INT,
                Existencia INT,
                Codigo NVARCHAR(255)
            )
            UPDATE [dbo].[EXISTENCIAS]
            SET Existencia = ${updateValue}, ExistenciaAnt = Existencia, Diferencia = ${difference}
            OUTPUT INSERTED.Id_Almacen, INSERTED.ExistenciaAnt, INSERTED.Existencia, INSERTED.Codigo INTO @UpdatedData
            WHERE Codigo = @Codigo_Existence AND Id_Marca = @Id_Marca_Existence AND Id_Almacen = @Id_Almacen_Existence
            SELECT * FROM @UpdatedData;
        `;
    },
    updateExistenceTableTransfer: (updateValue, difference) => {
        return ` 
            DECLARE @UpdatedData TABLE (
                Id_Almacen INT,
                ExistenciaAnt INT,
                Existencia INT,
                Codigo NVARCHAR(255)
            )
            UPDATE [dbo].[EXISTENCIAS]
            SET Existencia = ${updateValue}, ExistenciaAnt = Existencia, Diferencia = ${difference}
            OUTPUT INSERTED.Id_Almacen, INSERTED.ExistenciaAnt, INSERTED.Existencia, INSERTED.Codigo INTO @UpdatedData
            WHERE Codigo = @Codigo_Existence_transfer AND Id_Marca = @Id_Marca_Existence_transfer AND Id_Almacen = @Id_Almacen_Existence_transfer
            IF @@ROWCOUNT = 0
            BEGIN
                INSERT INTO [dbo].[EXISTENCIAS] (Id_Almacen, ExistenciaAnt, Existencia, Diferencia, Codigo, Id_Marca, Id_Ubicacion, Periodo, IdOLEI)
                OUTPUT INSERTED.Id_Almacen, INSERTED.ExistenciaAnt, INSERTED.Existencia, INSERTED.Codigo INTO @UpdatedData
                VALUES (@Id_Almacen_Existence_transfer, 0, ${updateValue}, ${difference}, @Codigo_Existence_transfer, @Id_Marca_Existence_transfer, 1, 0, NULL)
            END
            SELECT * FROM @UpdatedData;
        `;
    },
};
//# sourceMappingURL=querys.js.map
export const querys = {

    //Auth
    auth: ` 
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
    ` ,

    // Users
    getAllUsers: "SELECT TOP(500) * FROM [OLEIDB1_CLIENTES].[dbo].[USUARIOS]",
    getUser: "SELECT * FROM [OLEIDB1_CLIENTES].[dbo].[USUARIOS] WHERE Nombre = ?",

    // Tables
    getFamilias: `SELECT TRIM(F.Nombre) AS Nombre FROM [dbo].[FAMILIAS] F`,
    getMarcas: `SELECT TRIM(M.Nombre) AS Nombre FROM [dbo].[MARCAS] M`,
    getFolios: `SELECT TRIM(P.Codigo) AS Codigo FROM [dbo].[PRODUCTOS] P`,

    // Clients
    getClientBySearch: `
        SELECT TOP(20) TRIM(C.Nombre) AS Nombre, C.Id_Cliente, C.Id_Almacen, C.Id_ListPre
        FROM [dbo].[CLIENTES] C
    `,


    // ...
    updateExistenceTable: ` 
        DECLARE @UpdatedData TABLE (
            Id_Almacen INT,
            ExistenciaAnt INT,
            Existencia INT,
            Codigo NVARCHAR(255)
        )
        UPDATE [dbo].[EXISTENCIAS]
        SET Existencia = Existencia + @Cantidad_Existence, ExistenciaAnt = Existencia, Diferencia = @Cantidad_Existence
        OUTPUT INSERTED.Id_Almacen, INSERTED.ExistenciaAnt, INSERTED.Existencia, INSERTED.Codigo INTO @UpdatedData
        WHERE Codigo = @Codigo_Existence AND Id_Marca = @Id_Marca_Existence AND Id_Almacen = @Id_Almacen_Existence
        SELECT * FROM @UpdatedData;
    `,
};
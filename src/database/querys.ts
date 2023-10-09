export const querys = {

    getAllProducts: `
        SELECT DISTINCT
        TRIM(P.Descripcion) AS Descripcion,
        P.Id_Familia,
        TRIM(P.Codigo) AS Codigo,
        TRIM(F.Nombre) AS Familia,
        TRIM(PR.Codigo) AS CodigoPrecio,
        PR.Precio,
        TRIM(E.Codigo) AS CodigoExistencia,
        E.Existencia,
        E.Id_Almacen,
        TRIM(M.Nombre) AS Marca,
        M.Id_Marca,
        PR.Id_ListaPrecios,
        CT.Impto
        FROM [OLEIDB1].[dbo].[PRODUCTOS] P
        JOIN [OLEIDB1].[dbo].[FAMILIAS] F ON P.Id_Familia = F.Id_Familia
        JOIN [OLEIDB1].[dbo].[PRECIOS] PR ON TRIM(P.Codigo) = TRIM(PR.Codigo)
        JOIN [OLEIDB1].[dbo].[EXISTENCIAS] E ON TRIM(P.Codigo) = TRIM(E.Codigo) AND PR.Id_Marca = E.Id_Marca
        JOIN [OLEIDB1].[dbo].[MARCAS] M ON PR.Id_Marca = M.Id_Marca
        JOIN [OLEIDB1].[dbo].[COSTOS] CT ON TRIM(P.Codigo) = TRIM(CT.Codigo) AND PR.Id_Marca = CT.Id_Marca
        WHERE PR.Id_ListaPrecios = @ListaPrecios AND E.Id_Almacen = @Almacen
    `,


    getProductsBySearch: `
        SELECT DISTINCT TRIM(P.Descripcion) AS Descripcion 
        FROM [OLEIDB1].[dbo].[PRODUCTOS] P
        JOIN [OLEIDB1].[dbo].[PRECIOS] PR ON TRIM(P.Codigo) = TRIM(PR.Codigo)
        JOIN [OLEIDB1].[dbo].[EXISTENCIAS] E ON TRIM(P.Codigo) = TRIM(E.Codigo) AND PR.Id_Marca = E.Id_Marca
    `,

    getProducById: "SELECT  FROM CLIENTES Where Id = @Id",

    getTotalProducts: "SELECT COUNT(*) FROM [OLEIDB1].[dbo].[CLIENTES]",

    getAllUsers: "SELECT TOP(500) * FROM [OLEIDB1_CLIENTES].[dbo].[USUARIOS]",

    getUser: "SELECT * FROM [OLEIDB1_CLIENTES].[dbo].[USUARIOS] WHERE Nombre = ?",

    // Tables
    getFamilias: `SELECT TRIM(F.Nombre) AS Nombre FROM [OLEIDB1].[dbo].[FAMILIAS] F`,
    getMarcas: `SELECT TRIM(M.Nombre) AS Nombre FROM [OLEIDB1].[dbo].[MARCAS] M`,
    getFolios: `SELECT TRIM(P.Codigo) AS Codigo FROM [OLEIDB1].[dbo].[PRODUCTOS] P`,

    // Clients
    getClientBySearch : `
        SELECT TOP(20) TRIM(C.Nombre) AS Nombre, C.Id_Cliente, C.Id_Almacen, C.Id_ListPre
        FROM [OLEIDB1].[dbo].[CLIENTES] C
    `
};
export const productsQuerys = {

    // Get all products ***
    getAllProducts: `
        SELECT DISTINCT
        TRIM(P.Descripcion) AS Descripcion,
        TRIM(P.Codigo) AS Codigo,
        E.Existencia,
        E.Id_Almacen,
        M.Id_Marca,
        TRIM(M.Nombre) AS Marca,
        PR.Id_ListaPrecios,

        P.Id_Familia,
        TRIM(F.Nombre) AS Familia,
        TRIM(PR.Codigo) AS CodigoPrecio,
        PR.Precio,
        TRIM(E.Codigo) AS CodigoExistencia,
        CT.Impto AS Impuesto

        FROM [dbo].[PRODUCTOS] P
        JOIN [dbo].[FAMILIAS] F ON P.Id_Familia = F.Id_Familia
        JOIN [dbo].[PRECIOS] PR ON P.Codigo = PR.Codigo
        JOIN [dbo].[EXISTENCIAS] E ON P.Codigo = E.Codigo AND PR.Id_Marca = E.Id_Marca
        JOIN [dbo].[MARCAS] M ON PR.Id_Marca = M.Id_Marca
        JOIN [dbo].[COSTOS] CT ON P.Codigo = CT.Codigo AND PR.Id_Marca = CT.Id_Marca
        WHERE PR.Id_ListaPrecios = @ListaPrecios AND E.Id_Almacen = @Almacen
    `,

    // Get product by id.
    getProducById: `
        SELECT
            TRIM(P.Descripcion) AS Descripcion,
            TRIM(P.Codigo) AS Codigo,
            E.Existencia,
            E.Id_Almacen,
            M.Id_Marca,
            TRIM(M.Nombre) AS Marca,
            PR.Id_ListaPrecios,
            P.Id_Familia,
            TRIM(F.Nombre) AS Familia,
            TRIM(PR.Codigo) AS CodigoPrecio,
            PR.Precio,
            TRIM(E.Codigo) AS CodigoExistencia,
            CT.Impto AS Impuesto,
            P.Observaciones,
            TRIM(CT.CodBar) AS CodBar
            FROM [dbo].[PRODUCTOS] P
        JOIN [dbo].[FAMILIAS] F ON P.Id_Familia = F.Id_Familia
        JOIN [dbo].[PRECIOS] PR ON P.Codigo = PR.Codigo
        JOIN [dbo].[EXISTENCIAS] E ON P.Codigo = E.Codigo AND PR.Id_Marca = E.Id_Marca
        JOIN [dbo].[MARCAS] M ON PR.Id_Marca = M.Id_Marca
        JOIN [dbo].[COSTOS] CT ON P.Codigo = CT.Codigo AND PR.Id_Marca = CT.Id_Marca
        WHERE P.Codigo = @Codigo AND M.Nombre = @Marca AND PR.Id_ListaPrecios = @ListaPrecios AND E.Id_Almacen = @Almacen
    `,

    // Get Products by Stock. Pagination.
    getAllProductsByStock: `
        SELECT
            TRIM(P.Descripcion) AS Descripcion,
            TRIM(P.Codigo) AS Codigo,
            E.Existencia,
            E.Id_Almacen,
            M.Id_Marca,
            TRIM(C.CodBar) AS CodBar,
            TRIM(M.Nombre) AS Marca,
            PR.Id_ListaPrecios
        FROM [dbo].[PRODUCTOS] P
        JOIN [dbo].[FAMILIAS] F ON P.Id_Familia = F.Id_Familia
        JOIN [dbo].[PRECIOS] PR ON P.Codigo = PR.Codigo
        JOIN [dbo].[EXISTENCIAS] E ON P.Codigo = E.Codigo AND PR.Id_Marca = E.Id_Marca
        JOIN [dbo].[COSTOS] C ON P.Codigo = C.Codigo AND PR.Id_Marca = C.Id_Marca
        JOIN [dbo].[MARCAS] M ON PR.Id_Marca = M.Id_Marca
        WHERE PR.Id_ListaPrecios = @Id_ListaPrecios
        ORDER BY P.Codigo
        OFFSET (@PageNumber - 1) * @PageSize ROWS
        FETCH NEXT @PageSize ROWS ONLY
    `,

    // Get Product by Stock and CodeBar.
    getProductByStockAndCodeBar: `
        SELECT 
            TRIM(P.Descripcion) AS Descripcion, 
            TRIM(P.Codigo) AS Codigo, 
            E.Existencia, 
            E.Id_Almacen, 
            M.Id_Marca, 
            TRIM(C.CodBar) AS CodBar, 
            TRIM(M.Nombre) AS Marca
        FROM [dbo].[PRODUCTOS] P
        JOIN [dbo].[EXISTENCIAS] E ON P.Codigo = E.Codigo
        JOIN [dbo].[COSTOS] C ON C.Codigo = P.Codigo
        JOIN [dbo].[MARCAS] M ON E.Id_Marca = M.Id_Marca
        WHERE C.CodBar = @CodeBar
    `,

    // Get number of products.
    getTotalProducts: "SELECT COUNT(*) FROM [dbo].[CLIENTES]",

    // Search products. ***
    getProductsBySearch: `
        SELECT DISTINCT TRIM(P.Descripcion) AS Descripcion 
        FROM [dbo].[PRODUCTOS] P
        JOIN [dbo].[PRECIOS] PR ON P.Codigo = PR.Codigo
        JOIN [dbo].[EXISTENCIAS] E ON P.Codigo = E.Codigo AND PR.Id_Marca = E.Id_Marca
    `,

    // Search products in inventory.
    getProductsBySearchInventory: `
        SELECT TOP(20)
            TRIM(P.Descripcion) AS Descripcion,
            TRIM(P.Codigo) AS Codigo,
            E.Existencia,
            E.Id_Almacen,
            M.Id_Marca,
            TRIM(M.Nombre) AS Marca,
            TRIM(F.Nombre) AS Familia,
            PR.Precio AS Precio
        FROM [dbo].[PRODUCTOS] P
        JOIN [dbo].[FAMILIAS] F ON P.Id_Familia = F.Id_Familia
        JOIN [dbo].[PRECIOS] PR ON P.Codigo = PR.Codigo
        JOIN [dbo].[EXISTENCIAS] E ON P.Codigo = E.Codigo AND PR.Id_Marca = E.Id_Marca
        JOIN [dbo].[COSTOS] C ON P.Codigo = C.Codigo AND PR.Id_Marca = C.Id_Marca
        JOIN [dbo].[MARCAS] M ON PR.Id_Marca = M.Id_Marca
        WHERE LOWER(P.Descripcion) LIKE '%' + LOWER(@searchTerm) + '%' AND  PR.Id_ListaPrecios = @Id_ListaPrecios
        ORDER BY P.Codigo
    `,
}
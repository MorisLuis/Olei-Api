export const productsQuerys = {



    // Get Products by Stock. Pagination.
    getAllProductsByStock: `
        SELECT
            TRIM(P.Descripcion) AS Descripcion,
            TRIM(P.Codigo) AS Codigo,
            E.Existencia,
            E.Id_Almacen,
            M.Id_Marca,
            TRIM(CT.CodBar) AS CodBar,
            TRIM(M.Nombre) AS Marca,
            PR.Id_ListaPrecios
        FROM [dbo].[PRODUCTOS] P
            JOIN [dbo].[FAMILIAS] F ON P.Id_Familia = F.Id_Familia
            JOIN [dbo].[PRECIOS] PR ON P.Codigo = PR.Codigo
            JOIN [dbo].[EXISTENCIAS] E ON P.Codigo = E.Codigo AND PR.Id_Marca = E.Id_Marca
            JOIN [dbo].[MARCAS] M ON PR.Id_Marca = M.Id_Marca
            JOIN [dbo].[COSTOS] CT ON P.Codigo = CT.Codigo AND PR.Id_Marca = CT.Id_Marca
        WHERE PR.Id_ListaPrecios = @Id_ListaPrecios  AND E.Id_Almacen = @Almacen
        ORDER BY P.Codigo
        OFFSET (@PageNumber - 1) * @PageSize ROWS
        FETCH NEXT @PageSize ROWS ONLY
    `,


    getTotalOfAllProductsByStock: `
        SELECT COUNT(*) AS TotalProductos
        FROM [dbo].[PRODUCTOS] P
            JOIN [dbo].[PRECIOS] PR ON P.Codigo = PR.Codigo
            JOIN [dbo].[EXISTENCIAS] E ON P.Codigo = E.Codigo AND PR.Id_Marca = E.Id_Marca
        WHERE PR.Id_ListaPrecios = @Id_ListaPrecios AND E.Id_Almacen = @Almacen;
    `,

    // Get Product by Stock and CodeBar.
    getProductByStockAndCodeBar: `
        SELECT
            TRIM(P.Descripcion) AS Descripcion,
            TRIM(P.Codigo) AS Codigo,
            E.Existencia,
            E.Id_Almacen,
            M.Id_Marca,
            PR.Id_ListaPrecios,
            TRIM(CT.CodBar) AS CodBar,
            TRIM(M.Nombre) AS Marca
        FROM [dbo].[PRODUCTOS] P
            JOIN [dbo].[PRECIOS] PR ON P.Codigo = PR.Codigo
            JOIN [dbo].[EXISTENCIAS] E ON P.Codigo = E.Codigo AND PR.Id_Marca = E.Id_Marca
            JOIN [dbo].[MARCAS] M ON PR.Id_Marca = M.Id_Marca
            JOIN [dbo].[COSTOS] CT ON P.Codigo = CT.Codigo AND PR.Id_Marca = CT.Id_Marca
            WHERE
        PR.Id_ListaPrecios = @Id_ListaPrecios AND
            (@CodBar IS NULL OR TRIM(CT.CodBar) = @CodBar)
        AND (@Codigo IS NULL OR TRIM(P.Codigo) = @Codigo)
        AND E.Id_Almacen = @Id_Almacen
    `,

    //This is a double verification to 'UPC-A' and 'EAN-13' codebar.
    getProductByStockAndCodeBarDV: `
        SELECT
            TRIM(P.Descripcion) AS Descripcion,
            TRIM(P.Codigo) AS Codigo,
            E.Existencia,
            E.Id_Almacen,
            M.Id_Marca,
            PR.Id_ListaPrecios,
            TRIM(CT.CodBar) AS CodBar,
            TRIM(M.Nombre) AS Marca
        FROM [dbo].[PRODUCTOS] P
            JOIN [dbo].[PRECIOS] PR ON P.Codigo = PR.Codigo
            JOIN [dbo].[EXISTENCIAS] E ON P.Codigo = E.Codigo AND PR.Id_Marca = E.Id_Marca
            JOIN [dbo].[MARCAS] M ON PR.Id_Marca = M.Id_Marca
            JOIN [dbo].[COSTOS] CT ON P.Codigo = CT.Codigo AND PR.Id_Marca = CT.Id_Marca
        WHERE PR.Id_ListaPrecios = @Id_ListaPrecios AND E.Id_Almacen = @Id_Almacen
            AND (TRIM(CT.CodBar) = @CodBar OR
            TRIM(CT.CodBar) = SUBSTRING(@CodBar, 2, LEN(@CodBar) - 1))
    `,

    // Get number of products.
    getTotalProducts: "SELECT COUNT(*) FROM [dbo].[CLIENTES]",

    // Search products. ***
    getProductsBySearch: `
        SELECT TOP(10)
            TRIM(P.Descripcion) AS Descripcion
        FROM [dbo].[PRODUCTOS] P
            JOIN [dbo].[PRECIOS] PR ON P.Codigo = PR.Codigo
            JOIN [dbo].[EXISTENCIAS] E ON P.Codigo = E.Codigo AND PR.Id_Marca = E.Id_Marca
            JOIN [dbo].[FAMILIAS] F ON P.Id_Familia = F.Id_Familia
            JOIN [dbo].[MARCAS] M ON PR.Id_Marca = M.Id_Marca
        WHERE LOWER(P.Descripcion) LIKE '%' + LOWER(@Descripcion) + '%'
            AND PR.Id_ListaPrecios = @Id_ListaPrecios AND E.Id_Almacen = @Id_Almacen
            AND LOWER(P.Codigo) LIKE '%' + LOWER(@Codigo) + '%'
            AND LOWER(F.Nombre) LIKE '%' + LOWER(@familia) + '%'
            AND LOWER(M.Nombre) LIKE '%' + LOWER(@marca) + '%'
            AND (@SwSinStock = 0 OR E.Existencia > 0)
            AND (@SwsinPrecio = 0 OR PR.Precio > 0)
        ORDER BY
        CASE 
            WHEN LOWER(P.Descripcion) LIKE LOWER(@Descripcion) + '%' THEN 0 -- Prioridad para coincidencia inicial
            ELSE 1
        END,
        P.Descripcion; -- Luego orden alfabético
    `,

    // Search products in inventory.
    getProductsBySearchInventory: `
        SELECT TOP(10)
            P.Descripcion AS Descripcion,
            P.Codigo AS Codigo,
            P.SKU,
            C.CodBar,
            M.Nombre AS Marca,
            CONCAT(TRIM(P.Codigo), '-', M.Id_Marca, '-', TRIM(M.Nombre), '-', E.Id_Almacen, '-', PR.Id_ListaPrecios) AS UniqueKey
        FROM [dbo].[PRODUCTOS] P
            JOIN [dbo].[PRECIOS] PR ON P.Codigo = PR.Codigo
            JOIN [dbo].[EXISTENCIAS] E ON P.Codigo = E.Codigo AND PR.Id_Marca = E.Id_Marca
            JOIN [dbo].[MARCAS] M ON PR.Id_Marca = M.Id_Marca
            JOIN [dbo].[COSTOS] C ON P.Codigo = C.Codigo
        WHERE 
            (P.Descripcion LIKE '%' + @searchTerm + '%' 
            OR P.SKU LIKE '%' + @searchTerm + '%'
            OR P.Codigo LIKE '%' + @searchTerm + '%')
            AND E.Id_Almacen = @Id_Almacen 
            AND PR.Id_ListaPrecios = @Id_ListPre;
    `,

    getProductsBySearchInventoryWithoutCodebar: `
        SELECT TOP(10)
            P.Descripcion AS Descripcion,
            P.Codigo AS Codigo,
            P.SKU,
            C.CodBar,
            M.Nombre AS Marca,
            CONCAT(TRIM(P.Codigo), '-', M.Id_Marca, '-', TRIM(M.Nombre), '-', E.Id_Almacen, '-', PR.Id_ListaPrecios) AS UniqueKey
        FROM [dbo].[PRODUCTOS] P
            JOIN [dbo].[PRECIOS] PR ON P.Codigo = PR.Codigo
            JOIN [dbo].[EXISTENCIAS] E ON P.Codigo = E.Codigo AND PR.Id_Marca = E.Id_Marca
            JOIN [dbo].[MARCAS] M ON PR.Id_Marca = M.Id_Marca
            JOIN [dbo].[COSTOS] C ON P.Codigo = C.Codigo
        WHERE 
            (P.Descripcion LIKE '%' + @searchTerm + '%' 
            OR P.SKU LIKE '%' + @searchTerm + '%'
            OR P.Codigo LIKE '%' + @searchTerm + '%')
            AND E.Id_Almacen = @Id_Almacen 
            AND PR.Id_ListaPrecios = @Id_ListPre
            AND C.CodBar = '';
    `,
}
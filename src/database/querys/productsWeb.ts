export const productsWebQuerys = {

    // Get all products.
    getAllProducts: `
        WITH PagedProducts AS (
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
                'https://oleistorage.blob.core.windows.net/' + @baseSQL + '/' + TRIM(P.Codigo) + '.jpg' AS imagen,
                ROW_NUMBER() OVER (ORDER BY P.Codigo) AS RowNum
            FROM [dbo].[PRODUCTOS] P
            JOIN [dbo].[FAMILIAS] F ON P.Id_Familia = F.Id_Familia
            JOIN [dbo].[PRECIOS] PR ON P.Codigo = PR.Codigo
            JOIN [dbo].[EXISTENCIAS] E ON P.Codigo = E.Codigo AND PR.Id_Marca = E.Id_Marca
            JOIN [dbo].[MARCAS] M ON PR.Id_Marca = M.Id_Marca
            JOIN [dbo].[COSTOS] CT ON P.Codigo = CT.Codigo AND PR.Id_Marca = CT.Id_Marca
            WHERE PR.Id_ListaPrecios = @Id_ListPre AND E.Id_Almacen = @Id_Almacen
                AND LOWER(P.Descripcion) LIKE '%' + LOWER(@nombre) + '%'
                AND LOWER(M.Nombre) LIKE '%' + LOWER(@marca) + '%'
                AND LOWER(F.Nombre) LIKE '%' + LOWER(@familia) + '%'
                AND LOWER(P.Codigo) LIKE '%' + LOWER(@codigo) + '%'
                AND (@SwSinStock = 0 OR E.Existencia > 0)
                AND (@SwsinPrecio = 0 OR PR.Precio > 0)
        )
        SELECT *
        FROM PagedProducts
        WHERE RowNum BETWEEN (@page - 1) * @limit + 1 AND @page * @limit;
    `,

    getTotalProducts: `
        SELECT COUNT(*)
        FROM [dbo].[PRODUCTOS] P
        JOIN [dbo].[FAMILIAS] F ON P.Id_Familia = F.Id_Familia
        JOIN [dbo].[PRECIOS] PR ON P.Codigo = PR.Codigo
        JOIN [dbo].[EXISTENCIAS] E ON P.Codigo = E.Codigo AND PR.Id_Marca = E.Id_Marca
        JOIN [dbo].[MARCAS] M ON PR.Id_Marca = M.Id_Marca
        JOIN [dbo].[COSTOS] CT ON P.Codigo = CT.Codigo AND PR.Id_Marca = CT.Id_Marca
        WHERE PR.Id_ListaPrecios = @Id_ListPre AND E.Id_Almacen = @Id_Almacen
        AND LOWER(P.Descripcion) LIKE '%' + LOWER(@nombre) + '%'
        AND LOWER(M.Nombre) LIKE '%' + LOWER(@marca) + '%'
        AND LOWER(F.Nombre) LIKE '%' + LOWER(@familia) + '%'
        AND LOWER(P.Codigo) LIKE '%' + LOWER(@codigo) + '%'
        AND (@SwSinStock = 0 OR E.Existencia > 0)
        AND (@SwsinPrecio = 0 OR PR.Precio > 0)
    `
}
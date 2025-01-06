"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.productsWebQuerys = void 0;
exports.productsWebQuerys = {
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
                'https://oleistorage.blob.core.windows.net/' +  LOWER(SUBSTRING(@baseSQL, CHARINDEX('_', @baseSQL) + 1, LEN(@baseSQL))) + '/' + TRIM(P.Codigo) + '.jpg' AS imagen,
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
        WHERE RowNum BETWEEN (@page - 1) * @limit + 1 AND @page * @limit
        ORDER BY 
        CASE 
            WHEN LOWER(Descripcion) LIKE LOWER(@nombre) + '%' THEN 0 -- Prioridad para coincidencia inicial
            ELSE 1
        END,
        Descripcion -- Luego orden alfabético
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
            TRIM(CT.CodBar) AS CodBar,
            'https://oleistorage.blob.core.windows.net/' +  LOWER(SUBSTRING(@baseSQL, CHARINDEX('_', @baseSQL) + 1, LEN(@baseSQL))) + '/' + TRIM(P.Codigo) + '.jpg' AS imagen
            FROM [dbo].[PRODUCTOS] P
        JOIN [dbo].[FAMILIAS] F ON P.Id_Familia = F.Id_Familia
        JOIN [dbo].[PRECIOS] PR ON P.Codigo = PR.Codigo
        JOIN [dbo].[EXISTENCIAS] E ON P.Codigo = E.Codigo AND PR.Id_Marca = E.Id_Marca
        JOIN [dbo].[MARCAS] M ON PR.Id_Marca = M.Id_Marca
        JOIN [dbo].[COSTOS] CT ON P.Codigo = CT.Codigo AND PR.Id_Marca = CT.Id_Marca
        WHERE P.Codigo = @Codigo 
        AND M.Nombre = @Marca 
        AND PR.Id_ListaPrecios = @ListaPrecios 
        AND E.Id_Almacen = @Almacen
    `,
    getTotalProducts: `
        SELECT COUNT(*) AS TotalCount
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
    `,
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
};
//# sourceMappingURL=productsWeb.js.map
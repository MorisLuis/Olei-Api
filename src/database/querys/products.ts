const baseProductsFromClause = `
    FROM [dbo].[PRODUCTOS] P
        INNER JOIN [dbo].[PRECIOS] PR
            ON  PR.Codigo = P.Codigo
            AND PR.Id_ListaPrecios = @Id_ListaPrecios
        LEFT JOIN [dbo].[EXISTENCIAS] E
            ON E.Codigo = P.Codigo
            AND E.Id_Marca = PR.Id_Marca
            AND E.Id_Almacen = @Id_Almacen
        INNER JOIN [dbo].[MARCAS] M
            ON M.Id_Marca = PR.Id_Marca
        INNER JOIN [dbo].[COSTOS] C
            ON C.Codigo = P.Codigo
            AND C.Id_Marca = PR.Id_Marca
`;

const inventorySearchOrderByClause = `
    ORDER BY
        CASE
            WHEN C.CodBar = @searchTerm THEN 0
            WHEN P.Codigo = @searchTerm THEN 1
            WHEN P.SKU = @searchTerm THEN 2
            WHEN P.Descripcion LIKE @searchTerm + '%' THEN 3
            ELSE 4
        END,
        P.Descripcion,
        P.Codigo,
        M.Nombre
`;

export const productsQuerys = {

    /**
     * @description Returns a product by its code and brand, including its price, stock, and image.
     * 
     * Business rules:
     * - If @Marca is NULL, it will return the product regardless of its brand.
     * - The image URL is constructed based on the baseSQL parameter and the product code.
     * - The query joins multiple tables to retrieve all necessary information about the product.
     */

    getProducById: `
        SELECT
            TRIM(P.Descripcion) AS Descripcion,
            E.Existencia,
            TRIM(P.Codigo) AS Codigo,
            E.Id_Almacen,
            M.Id_Marca,
            TRIM(C.CodBar) AS CodBar,
            TRIM(M.Nombre) AS Marca,
            PR.Id_ListaPrecios,
            PR.Precio,
            P.Id_Familia,
            TRIM(F.Nombre) AS Familia,
            TRIM(PR.Codigo) AS CodigoPrecio,
            TRIM(E.Codigo) AS CodigoExistencia,
            C.Impto AS Impuesto,
            P.Observaciones,
            'https://oleistorage.blob.core.windows.net/' +  LOWER(SUBSTRING(@baseSQL, CHARINDEX('_', @baseSQL) + 1, LEN(@baseSQL))) + '/' + TRIM(P.Codigo) + '.jpg' AS imagen
            ${baseProductsFromClause}
            JOIN [dbo].[FAMILIAS] F ON P.Id_Familia = F.Id_Familia
        WHERE P.Codigo = @Codigo 
        AND (
            @Marca IS NULL
            OR M.Nombre = @Marca
        )
        AND PR.Id_ListaPrecios = @Id_ListaPrecios
    `,

    /**
     * @description Returns a paginated list of products for a warehouse and price list.
     * 
     * Business rules:
     * - If @SalidaSinExistencias = 1, it will return all products regardless of stock.
     * - If @SalidaSinExistencias = 0, it will return only products with stock greater than 0.
     */

    getAllProductsByStock: `
        SELECT
            TRIM(P.Descripcion) AS Descripcion,
            TRIM(P.Codigo) AS Codigo,
            E.Existencia,
            E.Id_Almacen,
            M.Id_Marca,
            TRIM(C.CodBar) AS CodBar,
            TRIM(M.Nombre) AS Marca,
            PR.Id_ListaPrecios,
            PR.Precio
        ${baseProductsFromClause}
        WHERE PR.Id_ListaPrecios = @Id_ListaPrecios  
            AND (
                @SalidaSinExistencias = 1
                OR E.Existencia > 0
            )
        ORDER BY P.Codigo
        OFFSET (@PageNumber - 1) * @PageSize ROWS
        FETCH NEXT @PageSize ROWS ONLY
    `,

    /**
     * @description Returns the total count of products for a warehouse and price list.
     * 
     * Business rules:
     * - If @SalidaSinExistencias = 1, it will count all products regardless of stock.
     * - If @SalidaSinExistencias = 0, it will count only products with stock greater than 0.
     */

    getTotalOfAllProductsByStock: `
        SELECT 
            COUNT(*) AS TotalProductos
        ${baseProductsFromClause}
        WHERE PR.Id_ListaPrecios = @Id_ListaPrecios 
            AND (
                @SalidaSinExistencias = 1
                OR E.Existencia > 0
            );
    `,


    /**
     * @description Returns products filtered by barcode, code, or SKU.
     * 
     * Business rules:
     * - If @SalidaSinExistencias = 1, it will return all products regardless of stock.
     * - If @SalidaSinExistencias = 0, it will return only products with stock greater than 0.
     */

    getProductByStockAndCodeBar: `
        SELECT
            TRIM(P.Descripcion) AS Descripcion,
            TRIM(P.Codigo) AS Codigo,
            P.SKU,
            E.Existencia,
            E.Id_Almacen,
            M.Id_Marca,
            PR.Id_ListaPrecios,
            TRIM(C.CodBar) AS CodBar,
            TRIM(M.Nombre) AS Marca,
            PR.Precio
        ${baseProductsFromClause}
        WHERE PR.Id_ListaPrecios = @Id_ListaPrecios 
            AND (
                @SalidaSinExistencias = 1
                OR E.Existencia > 0
            )
            AND (
                NULLIF(TRIM(@CodBar), '') IS NULL
                OR TRIM(C.CodBar) = TRIM(@CodBar)
            )
            AND (
                NULLIF(TRIM(@Codigo), '') IS NULL
                OR TRIM(P.Codigo) = TRIM(@Codigo)
            )
            AND (
                NULLIF(TRIM(@SKU), '') IS NULL
                OR TRIM(P.SKU) = TRIM(@SKU)
            );
    `,

    /**
     * @description Returns a product by barcode and supports barcodes with a leading verification digit.
     */

    getProductByStockAndCodeBarDV: `
        SELECT
            TRIM(P.Descripcion) AS Descripcion,
            TRIM(P.Codigo) AS Codigo,
            E.Existencia,
            E.Id_Almacen,
            M.Id_Marca,
            PR.Id_ListaPrecios,
            TRIM(C.CodBar) AS CodBar,
            TRIM(M.Nombre) AS Marca,
            PR.Precio
        ${baseProductsFromClause}
        WHERE PR.Id_ListaPrecios = @Id_ListaPrecios 
            AND E.Id_Almacen = @Id_Almacen
            AND (
                @SalidaSinExistencias = 1
                OR E.Existencia > 0
            )
            AND (
                TRIM(C.CodBar) = TRIM(@CodBar)
                OR (
                    LEN(TRIM(ISNULL(@CodBar, ''))) > 1
                    AND TRIM(C.CodBar) = RIGHT(TRIM(@CodBar), LEN(TRIM(@CodBar)) - 1)
                )
            );         
    `,

    /**
     * @description Searches products in inventory by description, SKU, code, or barcode.
     *
     * Business rules:
     * - If @SalidaSinExistencias = 1, it returns all products regardless of stock.
     * - If @SalidaSinExistencias = 0, it returns only products with stock greater than 0.
     */

    getProductsBySearchInventory: `
        SELECT TOP (10)
            TRIM(P.Descripcion) AS Descripcion,
            TRIM(P.Codigo) AS Codigo,
            TRIM(P.SKU) AS SKU,
            E.Id_Almacen,
            E.Existencia,
            TRIM(C.CodBar) AS CodBar,
            M.Id_Marca,
            TRIM(M.Nombre) AS Marca,
            CONCAT(TRIM(P.Codigo), '-', M.Id_Marca, '-', TRIM(M.Nombre), '-', COALESCE(E.Id_Almacen, @Id_Almacen), '-', PR.Id_ListaPrecios) AS UniqueKey
        ${baseProductsFromClause}
        WHERE
            (
                @SalidaSinExistencias = 1
                OR E.Existencia > 0
            )
            AND (
                P.Descripcion LIKE '%' + @searchTerm + '%'
                OR P.SKU LIKE '%' + @searchTerm + '%'
                OR P.Codigo LIKE '%' + @searchTerm + '%'
                OR C.CodBar LIKE '%' + @searchTerm + '%'
            )
        ${inventorySearchOrderByClause};
    `,

    /**
     * @description Searches products in inventory by description, SKU, or code when barcode is missing.
     *
     * Business rules:
     * - If @SalidaSinExistencias = 1, it returns all products regardless of stock.
     * - If @SalidaSinExistencias = 0, it returns only products with stock greater than 0.
     */

    getProductsBySearchInventoryWithoutCodebar: `
        SELECT TOP (10)
            TRIM(P.Descripcion) AS Descripcion,
            TRIM(P.Codigo) AS Codigo,
            TRIM(P.SKU) AS SKU,
            E.Id_Almacen,
            E.Existencia,
            TRIM(C.CodBar) AS CodBar,
            M.Id_Marca,
            TRIM(M.Nombre) AS Marca,
            CONCAT(TRIM(P.Codigo), '-', M.Id_Marca, '-', TRIM(M.Nombre), '-', COALESCE(E.Id_Almacen, @Id_Almacen), '-', PR.Id_ListaPrecios) AS UniqueKey
        ${baseProductsFromClause}
        WHERE
            (
                @SalidaSinExistencias = 1
                OR E.Existencia > 0
            )
            AND (
                P.Descripcion LIKE '%' + @searchTerm + '%'
                OR P.SKU LIKE '%' + @searchTerm + '%'
                OR P.Codigo LIKE '%' + @searchTerm + '%'
            )
            AND NULLIF(TRIM(C.CodBar), '') IS NULL
        ${inventorySearchOrderByClause};
    `,
}
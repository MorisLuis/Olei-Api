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

// NOTE: ORDER BY CASE removed in favor of prioritized UNION searches below.

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
        -- Prioritized UNION search: exact CodBar, exact Codigo, exact SKU, prefix description, fallback contains/like
        WITH SearchUnion AS (
            SELECT
                TRIM(P.Descripcion) AS Descripcion,
                TRIM(P.Codigo) AS Codigo,
                TRIM(P.SKU) AS SKU,
                E.Id_Almacen,
                E.Existencia,
                TRIM(C.CodBar) AS CodBar,
                M.Id_Marca,
                TRIM(M.Nombre) AS Marca,
                CONCAT(TRIM(P.Codigo), '-', M.Id_Marca, '-', TRIM(M.Nombre), '-', COALESCE(E.Id_Almacen, @Id_Almacen), '-', PR.Id_ListaPrecios) AS UniqueKey,
                0 AS priority
            ${baseProductsFromClause}
            WHERE (@SalidaSinExistencias = 1 OR E.Existencia > 0)
                AND C.CodBar = LTRIM(RTRIM(@searchTerm))

            UNION ALL

            SELECT
                TRIM(P.Descripcion), TRIM(P.Codigo), TRIM(P.SKU), E.Id_Almacen, E.Existencia, TRIM(C.CodBar), M.Id_Marca, TRIM(M.Nombre),
                CONCAT(TRIM(P.Codigo), '-', M.Id_Marca, '-', TRIM(M.Nombre), '-', COALESCE(E.Id_Almacen, @Id_Almacen), '-', PR.Id_ListaPrecios),
                1 AS priority
            ${baseProductsFromClause}
            WHERE (@SalidaSinExistencias = 1 OR E.Existencia > 0)
                AND P.Codigo = LTRIM(RTRIM(@searchTerm))

            UNION ALL

            SELECT
                TRIM(P.Descripcion), TRIM(P.Codigo), TRIM(P.SKU), E.Id_Almacen, E.Existencia, TRIM(C.CodBar), M.Id_Marca, TRIM(M.Nombre),
                CONCAT(TRIM(P.Codigo), '-', M.Id_Marca, '-', TRIM(M.Nombre), '-', COALESCE(E.Id_Almacen, @Id_Almacen), '-', PR.Id_ListaPrecios),
                2 AS priority
            ${baseProductsFromClause}
            WHERE (@SalidaSinExistencias = 1 OR E.Existencia > 0)
                AND P.SKU = LTRIM(RTRIM(@searchTerm))

            UNION ALL

            SELECT
                TRIM(P.Descripcion), TRIM(P.Codigo), TRIM(P.SKU), E.Id_Almacen, E.Existencia, TRIM(C.CodBar), M.Id_Marca, TRIM(M.Nombre),
                CONCAT(TRIM(P.Codigo), '-', M.Id_Marca, '-', TRIM(M.Nombre), '-', COALESCE(E.Id_Almacen, @Id_Almacen), '-', PR.Id_ListaPrecios),
                3 AS priority
            ${baseProductsFromClause}
            WHERE (@SalidaSinExistencias = 1 OR E.Existencia > 0)
                AND P.Descripcion LIKE LTRIM(RTRIM(@searchTerm)) + '%'

            UNION ALL

            SELECT
                TRIM(P.Descripcion), TRIM(P.Codigo), TRIM(P.SKU), E.Id_Almacen, E.Existencia, TRIM(C.CodBar), M.Id_Marca, TRIM(M.Nombre),
                CONCAT(TRIM(P.Codigo), '-', M.Id_Marca, '-', TRIM(M.Nombre), '-', COALESCE(E.Id_Almacen, @Id_Almacen), '-', PR.Id_ListaPrecios),
                4 AS priority
            ${baseProductsFromClause}
            WHERE (@SalidaSinExistencias = 1 OR E.Existencia > 0)
                AND P.Descripcion LIKE '%' + LTRIM(RTRIM(@searchTerm)) + '%'
        )

        SELECT DISTINCT TOP (10)
            Descripcion,
            Codigo,
            SKU,
            Id_Almacen,
            Existencia,
            CodBar,
            Id_Marca,
            Marca,
            UniqueKey
        FROM SearchUnion
        ORDER BY priority, Descripcion, Codigo, Marca;
    `,

    /**
     * @description Searches products in inventory by description, SKU, or code when barcode is missing.
     *
     * Business rules:
     * - If @SalidaSinExistencias = 1, it returns all products regardless of stock.
     * - If @SalidaSinExistencias = 0, it returns only products with stock greater than 0.
     */

    getProductsBySearchInventoryWithoutCodebar: `
        -- Prioritized UNION search for products without codbar values
        WITH SearchUnion AS (
            SELECT
                TRIM(P.Descripcion) AS Descripcion,
                TRIM(P.Codigo) AS Codigo,
                TRIM(P.SKU) AS SKU,
                E.Id_Almacen,
                E.Existencia,
                TRIM(C.CodBar) AS CodBar,
                M.Id_Marca,
                TRIM(M.Nombre) AS Marca,
                CONCAT(TRIM(P.Codigo), '-', M.Id_Marca, '-', TRIM(M.Nombre), '-', COALESCE(E.Id_Almacen, @Id_Almacen), '-', PR.Id_ListaPrecios) AS UniqueKey,
                1 AS priority
            ${baseProductsFromClause}
            WHERE (@SalidaSinExistencias = 1 OR E.Existencia > 0)
                AND NULLIF(LTRIM(RTRIM(C.CodBar)), '') IS NULL
                AND P.Codigo = LTRIM(RTRIM(@searchTerm))

            UNION ALL

            SELECT
                TRIM(P.Descripcion), TRIM(P.Codigo), TRIM(P.SKU), E.Id_Almacen, E.Existencia, TRIM(C.CodBar), M.Id_Marca, TRIM(M.Nombre),
                CONCAT(TRIM(P.Codigo), '-', M.Id_Marca, '-', TRIM(M.Nombre), '-', COALESCE(E.Id_Almacen, @Id_Almacen), '-', PR.Id_ListaPrecios),
                2 AS priority
            ${baseProductsFromClause}
            WHERE (@SalidaSinExistencias = 1 OR E.Existencia > 0)
                AND NULLIF(LTRIM(RTRIM(C.CodBar)), '') IS NULL
                AND P.SKU = LTRIM(RTRIM(@searchTerm))

            UNION ALL

            SELECT
                TRIM(P.Descripcion), TRIM(P.Codigo), TRIM(P.SKU), E.Id_Almacen, E.Existencia, TRIM(C.CodBar), M.Id_Marca, TRIM(M.Nombre),
                CONCAT(TRIM(P.Codigo), '-', M.Id_Marca, '-', TRIM(M.Nombre), '-', COALESCE(E.Id_Almacen, @Id_Almacen), '-', PR.Id_ListaPrecios),
                3 AS priority
            ${baseProductsFromClause}
            WHERE (@SalidaSinExistencias = 1 OR E.Existencia > 0)
                AND NULLIF(LTRIM(RTRIM(C.CodBar)), '') IS NULL
                AND P.Descripcion LIKE LTRIM(RTRIM(@searchTerm)) + '%'

            UNION ALL

            SELECT
                TRIM(P.Descripcion), TRIM(P.Codigo), TRIM(P.SKU), E.Id_Almacen, E.Existencia, TRIM(C.CodBar), M.Id_Marca, TRIM(M.Nombre),
                CONCAT(TRIM(P.Codigo), '-', M.Id_Marca, '-', TRIM(M.Nombre), '-', COALESCE(E.Id_Almacen, @Id_Almacen), '-', PR.Id_ListaPrecios),
                4 AS priority
            ${baseProductsFromClause}
            WHERE (@SalidaSinExistencias = 1 OR E.Existencia > 0)
                AND NULLIF(LTRIM(RTRIM(C.CodBar)), '') IS NULL
                AND P.Descripcion LIKE '%' + LTRIM(RTRIM(@searchTerm)) + '%'
        )

        SELECT DISTINCT TOP (10)
            Descripcion,
            Codigo,
            SKU,
            Id_Almacen,
            Existencia,
            CodBar,
            Id_Marca,
            Marca,
            UniqueKey
        FROM SearchUnion
        ORDER BY priority, Descripcion, Codigo, Marca;
    `,
}
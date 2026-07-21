const stockAvailabilityCondition = `(@SalidaSinExistencias = 1 OR E.Existencia > 0)`;

const baseProductsFromClause = `
    FROM [dbo].[PRODUCTOS] P
        INNER JOIN [dbo].[PRECIOS] PR
            ON P.Codigo = PR.Codigo
        INNER JOIN [dbo].[EXISTENCIAS] E
            ON P.Codigo = E.Codigo
            AND PR.Id_Marca = E.Id_Marca
            AND ${stockAvailabilityCondition}
        INNER JOIN [dbo].[MARCAS] M
            ON PR.Id_Marca = M.Id_Marca
        INNER JOIN [dbo].[COSTOS] C
            ON P.Codigo = C.Codigo
            AND PR.Id_Marca = C.Id_Marca
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
            AND E.Id_Almacen = @Id_Almacen
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
            AND E.Id_Almacen = @Id_Almacen;
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
            AND E.Id_Almacen = @Id_Almacen
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
            TRIM(C.CodBar) AS CodBar,
            M.Id_Marca,
            TRIM(M.Nombre) AS Marca,
            CONCAT(TRIM(P.Codigo), '-', M.Id_Marca, '-', TRIM(M.Nombre), '-', E.Id_Almacen, '-', PR.Id_ListaPrecios) AS UniqueKey
        ${baseProductsFromClause}
        WHERE  E.Id_Almacen = @Id_Almacen 
            AND PR.Id_ListaPrecios = @Id_ListaPrecios  
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
            TRIM(C.CodBar) AS CodBar,
            M.Id_Marca,
            TRIM(M.Nombre) AS Marca,
            CONCAT(TRIM(P.Codigo), '-', M.Id_Marca, '-', TRIM(M.Nombre), '-', E.Id_Almacen, '-', PR.Id_ListaPrecios) AS UniqueKey
        ${baseProductsFromClause}
        WHERE E.Id_Almacen = @Id_Almacen
            AND PR.Id_ListaPrecios = @Id_ListaPrecios
            AND (
                P.Descripcion LIKE '%' + @searchTerm + '%'
                OR P.SKU LIKE '%' + @searchTerm + '%'
                OR P.Codigo LIKE '%' + @searchTerm + '%'
            )
            AND NULLIF(TRIM(C.CodBar), '') IS NULL
        ${inventorySearchOrderByClause};
    `,
}
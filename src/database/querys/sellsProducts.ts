export const sellsProductsQuery = {

    getSellsProducts: `
        WITH DETALLEVENTAS_CTE AS (
            SELECT
                D.Id_Almacen,
                D.TipoDoc,
                D.Folio,
                D.Partida,
        
                D.Codigo,
                D.Descripcion,
                D.Cantidad,
                D.Precio,
                D.Importe,
                D.Impuesto,
                V.Fecha,
                M.Nombre AS Marca
            FROM dbo.DETALLEVENTAS D
                JOIN dbo.VENTAS V ON V.Folio = D.Folio
                JOIN dbo.MARCAS M ON M.Id_Marca = D.Id_Marca
            WHERE (@Marca IS NULL OR M.Nombre = @Marca)
                AND (@Codigo IS NULL OR Codigo = @Codigo)
                AND (@Descripcion IS NULL OR Descripcion = @Descripcion)
                AND (@DateStart IS NULL OR CAST(Fecha AS DATE) >= @DateStart)
                AND (@DateEnd IS NULL OR CAST(Fecha AS DATE) <= @DateEnd)
                AND (@DateExactly IS NULL OR CAST(Fecha AS DATE) = @DateExactly)
        )
        SELECT * 
        FROM DETALLEVENTAS_CTE
        ORDER BY 
            CASE WHEN @OrderCondition = 'Folio' THEN CAST(Folio AS INT) END,
            CASE WHEN @OrderCondition = 'Codigo' THEN CAST(Codigo AS VARCHAR(50)) END,
            CASE WHEN @OrderCondition = 'Fecha' THEN CAST(Fecha AS DATETIME) END DESC,
            CASE WHEN @OrderCondition = 'Marca' THEN CAST(Marca AS VARCHAR(50)) END,
            CASE WHEN @OrderCondition = 'Descripcion' THEN CAST(Descripcion AS VARCHAR(50)) END
        OFFSET (@PageNumber - 1) * @PageSize ROWS
        FETCH NEXT @PageSize ROWS ONLY;
    `,

    getSellsDetailsByFolio: `
        SELECT 
            D.Id_Almacen,
            D.TipoDoc,
            D.Folio,
            D.Partida,
            D.Codigo,
            D.Descripcion,
            D.Cantidad,
            D.Precio,
            D.Importe,
            D.Impuesto,
            V.Fecha,
            M.Nombre AS Marca
        FROM dbo.DETALLEVENTAS D
            JOIN dbo.VENTAS V ON V.Folio = D.Folio
            JOIN dbo.MARCAS M ON M.Id_Marca = D.Id_Marca
        WHERE D.Id_Almacen = @Id_Almacen AND D.TipoDoc = @TipoDoc AND D.Serie = @Serie AND D.Folio = @Folio
    `,

    getSellsProductsTotals: `
        WITH 
        DETALLEVENTAS_CTE
            AS
            (
                SELECT
                    D.Id_Almacen,
                    D.TipoDoc,
                    D.Folio,
                    D.Partida,

                    D.Codigo,
                    D.Descripcion,
                    D.Cantidad,
                    D.Precio,
                    D.Importe,
                    D.Impuesto,
                    V.Fecha,
                    M.Nombre AS Marca
                FROM dbo.DETALLEVENTAS D
                    JOIN dbo.VENTAS V ON V.Folio = D.Folio
                    JOIN dbo.MARCAS M ON M.Id_Marca = D.Id_Marca
                WHERE (@Marca IS NULL OR M.Nombre = @Marca)
                    AND (@Codigo IS NULL OR Codigo = @Codigo)
                    AND (@Descripcion IS NULL OR Descripcion = @Descripcion)
                    AND (@DateStart IS NULL OR CAST(Fecha AS DATE) >= @DateStart)
                    AND (@DateEnd IS NULL OR CAST(Fecha AS DATE) <= @DateEnd)
                    AND (@DateExactly IS NULL OR CAST(Fecha AS DATE) = @DateExactly)
                    )
            SELECT
                SUM(Importe) AS SumaImporte,
                SUM(Impuesto) AS SumaImpuesto,
                ISNULL(SUM(Importe), 0) + ISNULL(SUM(Impuesto), 0) AS SumaTotal
            FROM DETALLEVENTAS_CTE
    `,

    getSellsProductsCount: `
        WITH DETALLEVENTAS_CTE AS (
            SELECT
                D.Id_Almacen,
                D.TipoDoc,
                D.Folio,
                D.Partida,
        
                D.Codigo,
                D.Descripcion,
                D.Cantidad,
                D.Precio,
                D.Importe,
                D.Impuesto,
                V.Fecha,
                M.Nombre AS Marca
            FROM dbo.DETALLEVENTAS D
                JOIN dbo.VENTAS V ON V.Folio = D.Folio
                JOIN dbo.MARCAS M ON M.Id_Marca = D.Id_Marca
            WHERE (@Marca IS NULL OR M.Nombre = @Marca)
                AND (@Codigo IS NULL OR Codigo = @Codigo)
                AND (@Descripcion IS NULL OR Descripcion = @Descripcion)
                AND (@DateStart IS NULL OR CAST(Fecha AS DATE) >= @DateStart)
                AND (@DateEnd IS NULL OR CAST(Fecha AS DATE) <= @DateEnd)
                AND (@DateExactly IS NULL OR CAST(Fecha AS DATE) = @DateExactly)
        )
        SELECT COUNT(*) AS TotalCount
        FROM DETALLEVENTAS_CTE
    `
}
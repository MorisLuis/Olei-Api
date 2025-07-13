
export const sellsQuery = {

    // Quote, Remission or Invoice.
    getSells: `
        /* Filtra ventas primero */
            WITH ventasFiltradas AS (
                SELECT  Id_Almacen,
                        Id_Cliente,
                        TipoDoc,
                        Serie,
                        Folio,
                        Subtotal,
                        Total,
                        Saldo,
                        Fecha
                FROM dbo.VENTAS
                WHERE Saldo > 0 AND (  
                        @dateExactly IS NOT NULL
                        AND Fecha = @dateExactly OR @dateExactly IS NULL
                        AND (@dateStart IS NULL OR Fecha >= @dateStart)
                        AND (@dateEnd   IS NULL OR Fecha <  DATEADD(day,1,@dateEnd))
                    )
            ),

            /* Agrupa por cliente */
            cte_result AS (
                SELECT
                    MIN(CONCAT(v.Id_Almacen, '-', v.Id_Cliente, '-', v.TipoDoc, '-', TRIM(v.Serie), '-', v.Folio)) AS UniqueKey,
                    c.Id_Cliente,
                    MAX(c.Nombre) AS Nombre,
                    SUM(v.Subtotal) AS Subtotal,
                    SUM(v.Total) AS Total
                FROM ventasFiltradas v
                JOIN dbo.CLIENTES  c
                    ON c.Id_Cliente = v.Id_Cliente
                    AND c.Id_Almacen = v.Id_Almacen
                WHERE   (@searchTerm = N'' OR c.Nombre LIKE N'%' + @searchTerm + N'%')
                GROUP BY c.Id_Cliente
            )
            
            /* Pagina y ordena */
            SELECT *
            FROM   cte_result
            ORDER BY
                CASE WHEN @searchTerm <> N'' AND cte_result.Nombre LIKE @searchTerm + N'%' THEN 0 ELSE 1 END,
                CASE @orderCondition WHEN 'Total'  THEN Total  END DESC,
                CASE @orderCondition WHEN 'Nombre' THEN Nombre END,
                Id_Cliente
            OFFSET (@pageNumber - 1) * @pageSize ROWS
            FETCH  NEXT @pageSize
            ROWS ONLY;
    `,

    getSellsTotal: `
        /* Filtra ventas primero */
        ;WITH ventasFiltradas AS (
            SELECT  Id_Almacen,
                    Id_Cliente,
                    TipoDoc,
                    Serie,
                    Folio,
                    Subtotal,
                    Total,
                    Saldo,
                    Fecha
            FROM dbo.VENTAS
            WHERE Saldo > 0 AND (  
                    @dateExactly IS NOT NULL
                    AND Fecha = @dateExactly OR @dateExactly IS NULL
                    AND (@dateStart IS NULL OR Fecha >= @dateStart)
                    AND (@dateEnd   IS NULL OR Fecha <  DATEADD(day,1,@dateEnd))
                )
        ),

        /* Agrupa por cliente */
        cte_result AS (
            SELECT
                MIN(CONCAT(v.Id_Almacen, '-', v.Id_Cliente, '-', v.TipoDoc, '-', TRIM(v.Serie), '-', v.Folio)) AS UniqueKey,
                c.Id_Cliente,
                MAX(c.Nombre)AS Nombre,
                SUM(v.Subtotal)AS Subtotal,
                SUM(v.Total)AS Total
            FROM ventasFiltradas v
            JOIN dbo.CLIENTES  c
                ON c.Id_Cliente = v.Id_Cliente
                AND c.Id_Almacen = v.Id_Almacen
            WHERE   (@searchTerm = N'' OR c.Nombre LIKE N'%' + @searchTerm + N'%')
            GROUP BY c.Id_Cliente
        )
        
        /* Sólo las sumas globales */
        SELECT
            SUM(Subtotal) AS SumaSubtotal,
            SUM(Total) AS SumaTotal
        FROM cte_result;
    `,

    getSellsCount: `
        /* Filtra ventas primero */
        ;WITH ventasFiltradas AS (
            SELECT  Id_Almacen,
                    Id_Cliente,
                    TipoDoc,
                    Serie,
                    Folio,
                    Subtotal,
                    Total,
                    Saldo,
                    Fecha
            FROM dbo.VENTAS
            WHERE Saldo > 0 AND (  
                    @dateExactly IS NOT NULL
                    AND Fecha = @dateExactly OR @dateExactly IS NULL
                    AND (@dateStart IS NULL OR Fecha >= @dateStart)
                    AND (@dateEnd   IS NULL OR Fecha <  DATEADD(day,1,@dateEnd))
                )
        ),
        
        /* Agrupa por cliente */
        cte_result AS (
            SELECT
                MIN(CONCAT(v.Id_Almacen, '-', v.Id_Cliente, '-', v.TipoDoc, '-', TRIM(v.Serie), '-', v.Folio)) AS UniqueKey,
                c.Id_Cliente,
                MAX(c.Nombre)AS Nombre,
                SUM(v.Subtotal)AS Subtotal,
                SUM(v.Total)AS Total
            FROM ventasFiltradas v
            JOIN dbo.CLIENTES  c
                ON c.Id_Cliente = v.Id_Cliente
                AND c.Id_Almacen = v.Id_Almacen
            WHERE   (@searchTerm = N'' OR c.Nombre LIKE N'%' + @searchTerm + N'%')
            GROUP BY c.Id_Cliente
        )
        
        /* Total */
        SELECT COUNT(*) AS TotalCount
        FROM cte_result;
    `,

    getSellsByClient: `
        WITH
        VENTAS_CTE
        AS
        (
            SELECT
                CONCAT(Id_Almacen, '-', TipoDoc, '-', TRIM(Serie), '-', Folio) AS UniqueKey,
                Id_Cliente,
                Id_Almacen,
                TipoDoc,
                Folio,
                Serie,
                Fecha,
                FechaEntrega,
                Saldo,
                Total,
                DATEDIFF(DAY, GETDATE(), FechaEntrega) AS ExpiredDays
            FROM [dbo].[VENTAS]
            WHERE Id_Cliente = @Id_Cliente
                AND TipoDoc IN (0,1,2)
                AND (@FilterTipoDoc = 0 OR (TipoDoc = @TipoDoc AND @FilterTipoDoc = 1))
                AND (@DateExactly IS NULL OR CAST(Fecha AS DATE) = @DateExactly)
                AND (@DateStart IS NULL OR CAST(Fecha AS DATE) >= @DateStart)
                AND (@DateEnd IS NULL OR CAST(Fecha AS DATE) <= @DateEnd)
        )
        SELECT *
        FROM VENTAS_CTE
        ORDER BY 
            CASE 
                WHEN @OrderCondition = 'TipoDoc' THEN TipoDoc 
                WHEN @OrderCondition = 'Folio' THEN Folio 
                WHEN @OrderCondition = 'Fecha' THEN Fecha 
                WHEN @OrderCondition = 'FechaEntrega' THEN FechaEntrega
            END DESC,
            CASE 
                WHEN @OrderCondition = 'TipoDoc' THEN Fecha 
                WHEN @OrderCondition = 'FechaEntrega' THEN Fecha
            END DESC,
            Fecha,
            TipoDoc
        OFFSET (@PageNumber - 1) * @PageSize ROWS
        FETCH NEXT @PageSize ROWS ONLY
    `,

    getSellsByClientTotal: `
        WITH
            VENTAS_CTE
            AS
            (
                SELECT
                    CONCAT(Id_Almacen, '-', TipoDoc, '-', TRIM(Serie), '-', Folio) AS UniqueKey,
                    Id_Cliente,
                    Id_Almacen,
                    TipoDoc,
                    Folio,
                    Serie,
                    Fecha,
                    FechaEntrega,
                    Subtotal,
                    Total
                FROM [dbo].[VENTAS]
                WHERE Id_Cliente = @Id_Cliente
                    AND TipoDoc IN (0,1,2)
                    AND (@FilterTipoDoc = 0 OR (TipoDoc = @TipoDoc AND @FilterTipoDoc = 1))
                    AND (@DateExactly IS NULL OR CAST(Fecha AS DATE) = @DateExactly)
                    AND (@DateStart IS NULL OR CAST(Fecha AS DATE) >= @DateStart)
                    AND (@DateEnd IS NULL OR CAST(Fecha AS DATE) <= @DateEnd)
            )
            SELECT 
                SUM(Subtotal) AS TotalSubtotal, 
                SUM(Total) AS TotalTotal
            FROM VENTAS_CTE;
    `,

    getSellsByClientCount: `
        SELECT COUNT(*) AS TotalCount
        FROM [dbo].[VENTAS]
        WHERE Id_Cliente = @Id_Cliente
            AND TipoDoc IN (0,1,2)
            AND ( @FilterTipoDoc = 0 OR (TipoDoc = @TipoDoc AND @FilterTipoDoc = 1))
            AND (@DateExactly IS NULL OR CAST(Fecha AS DATE) = @DateExactly)
            AND (@DateStart IS NULL OR CAST(Fecha AS DATE) >= @DateStart)
            AND (@DateEnd IS NULL OR CAST(Fecha AS DATE) <= @DateEnd)
    `,

    getSellById: `
        SELECT
            C.Nombre,
            V.Id_Cliente,
            V.Id_Almacen,
            V.TipoDoc,
            V.Folio,
            V.Serie,
            V.Fecha,
            V.Saldo,
            V.Total,
            V.Subtotal,
            V.Impuesto,
            V.FechaLiq,
            V.Piezas
        FROM dbo.VENTAS V
            JOIN [dbo].[CLIENTES] C ON C.Id_Cliente = V.Id_Cliente AND C.Id_Almacen = V.Id_Almacen
        WHERE V.Id_Almacen = @Id_Almacen AND TipoDoc = @TipoDoc AND Serie = @Serie AND Folio = @Folio
    `
}
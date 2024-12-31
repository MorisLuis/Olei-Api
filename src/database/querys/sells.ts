
export const sellsQuery = {

    // Quote, Remission or Invoice.
    getSells: `
        SELECT
            C.Id_Cliente,
            MAX(C.Nombre) AS Nombre, -- Usamos MAX ya que no agrupamos por Nombre
            MAX(C.Id_Almacen) AS Id_Almacen, -- Si necesitas un almacén asociado
            MIN(CONCAT(C.Id_Almacen, '-', C.Id_Cliente, '-', V.TipoDoc, '-', TRIM(V.Serie), '-', V.Folio)) AS UniqueKey, -- Una sola clave única
            SUM(V.Saldo) AS Saldo,
            SUM(V.Total) AS Total
        FROM [dbo].[CLIENTES] AS C
        INNER JOIN [dbo].[VENTAS] AS V 
            ON C.Id_Cliente = V.Id_Cliente AND C.Id_Almacen = V.Id_Almacen
        WHERE V.Saldo > 0
        GROUP BY 
            C.Id_Cliente,
            C.Id_Almacen
        ORDER BY 
            CASE WHEN @OrderCondition = 'Total' THEN SUM(V.Total) END DESC,
            CASE WHEN @OrderCondition = 'Saldo' THEN SUM(V.Saldo) END DESC,
            CASE WHEN @OrderCondition = 'Nombre' THEN MAX(C.Nombre) END,
            C.Id_Cliente
        OFFSET (@PageNumber - 1) * @PageSize ROWS
        FETCH NEXT @PageSize ROWS ONLY
    `,

    getTotalSells: `
        SELECT COUNT(*) AS TotalCount
        FROM (
            SELECT
                C.Id_Cliente
            FROM [dbo].[CLIENTES] AS C
            INNER JOIN [dbo].[VENTAS] AS V 
                ON C.Id_Cliente = V.Id_Cliente AND C.Id_Almacen = V.Id_Almacen
            WHERE V.Saldo > 0
            GROUP BY
                C.Id_Cliente,
                C.Id_Almacen
        ) AS Subquery
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
                AND (@FilterTipoDoc = 0 OR (TipoDoc = @TipoDoc AND @FilterTipoDoc = 1))
                AND (@FilterExpired = 0 OR (DATEDIFF(DAY, GETDATE(), FechaEntrega) < 0 AND @FilterExpired = 1))
                AND (@FilterNotExpired = 0 OR (DATEDIFF(DAY, GETDATE(), FechaEntrega) > 0 AND @FilterNotExpired = 1))
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
                WHEN @OrderCondition = 'ExpiredDays' THEN ExpiredDays
                WHEN @OrderCondition = 'FechaEntrega' THEN FechaEntrega
            END DESC,
            CASE 
                WHEN @OrderCondition = 'TipoDoc' THEN Fecha 
                WHEN @OrderCondition = 'ExpiredDays' THEN Fecha
                WHEN @OrderCondition = 'FechaEntrega' THEN Fecha
            END DESC,
            Fecha,
            TipoDoc
        OFFSET (@PageNumber - 1) * @PageSize ROWS
        FETCH NEXT @PageSize ROWS ONLY
    `,

    getTotalSellsByClient: `
        SELECT COUNT(*) AS TotalCount
        FROM [dbo].[VENTAS]
        WHERE Id_Cliente = @Id_Cliente
            AND (
                @FilterTipoDoc = 0 OR (TipoDoc = @TipoDoc AND @FilterTipoDoc = 1)
            )
            AND (
                @FilterExpired = 0 OR 
                (DATEDIFF(DAY, GETDATE(), FechaEntrega) < 0 AND DATEDIFF(DAY, GETDATE(), FechaEntrega) IS NOT NULL AND @FilterExpired = 1)
            )
            AND (
                    @FilterNotExpired = 0 OR 
                    (DATEDIFF(DAY, GETDATE(), FechaEntrega) > 0 AND DATEDIFF(DAY, GETDATE(), FechaEntrega) IS NOT NULL AND @FilterNotExpired = 1)
                )
            AND (
                @DateExactly IS NULL OR CAST(Fecha AS DATE) = @DateExactly
            )
            AND (
                @DateStart IS NULL OR CAST(Fecha AS DATE) >= @DateStart
            )
            AND (
                @DateEnd IS NULL OR CAST(Fecha AS DATE) <= @DateEnd
            )
    `,

    getSellById: `
        SELECT Id_Cliente, Id_Almacen, TipoDoc, Folio, Serie, Fecha, FechaEntrega, Saldo, Total, Subtotal, Impuesto, FechaLiq, Estado, Piezas
        FROM dbo.VENTAS
        WHERE Id_Almacen = @Id_Almacen AND TipoDoc = @TipoDoc AND Serie = @Serie AND Folio = @Folio
    `,

    getCobranza: `
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
                    FechaLiq,
                    Saldo,
                    Total,
                    DATEDIFF(DAY, GETDATE(), FechaEntrega) AS ExpiredDays
                FROM [dbo].[VENTAS]
                WHERE Id_Cliente = @Id_Cliente
                    AND Saldo > 0
                    AND FechaLiq >= CAST(GETDATE() AS DATE) -- Condición para FechaLiq
                    AND ( @FilterTipoDoc = 0 OR (TipoDoc = @TipoDoc AND @FilterTipoDoc = 1) )
                    AND (@FilterExpired = 0 OR (DATEDIFF(DAY, GETDATE(), FechaEntrega) < 0 AND @FilterExpired = 1))
                    AND (@FilterNotExpired = 0 OR (DATEDIFF(DAY, GETDATE(), FechaEntrega) > 0 AND @FilterNotExpired = 1))
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
                WHEN @OrderCondition = 'ExpiredDays' THEN ExpiredDays
                WHEN @OrderCondition = 'FechaEntrega' THEN Fecha 
            END DESC,
            CASE 
                WHEN @OrderCondition = 'TipoDoc' THEN Fecha 
                WHEN @OrderCondition = 'ExpiredDays' THEN Fecha
                WHEN @OrderCondition = 'FechaEntrega' THEN Fecha
            END DESC,
            Fecha,
            TipoDoc
        OFFSET (@PageNumber - 1) * @PageSize ROWS
        FETCH NEXT @PageSize ROWS ONLY
    `,

    getTotalCobranza: `
        SELECT COUNT(*) AS TotalCount
        FROM [dbo].[VENTAS]
        WHERE Id_Cliente = @Id_Cliente
        AND Saldo > 0
        AND FechaLiq >= CAST(GETDATE() AS DATE) -- Condición para FechaLiq
        AND ( @FilterTipoDoc = 0 OR (TipoDoc = @TipoDoc AND @FilterTipoDoc = 1) )
        AND (@FilterExpired = 0 OR (DATEDIFF(DAY, GETDATE(), FechaEntrega) < 0 AND @FilterExpired = 1))
        AND (@FilterNotExpired = 0 OR (DATEDIFF(DAY, GETDATE(), FechaEntrega) > 0 AND @FilterNotExpired = 1))
        AND (@DateExactly IS NULL OR CAST(Fecha AS DATE) = @DateExactly)
        AND (@DateStart IS NULL OR CAST(Fecha AS DATE) >= @DateStart)
        AND (@DateEnd IS NULL OR CAST(Fecha AS DATE) <= @DateEnd)
    `
}
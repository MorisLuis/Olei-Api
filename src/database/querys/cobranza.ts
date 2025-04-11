

export const cobranzaQuery = {

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
    `,

    getCobranzaWithTotals: `
        DECLARE @Ventas TABLE (
            UniqueKey NVARCHAR(100),
            Id_Cliente INT,
            Id_Almacen INT,
            TipoDoc VARCHAR(10),
            Folio INT,
            Serie VARCHAR(10),
            Fecha DATETIME,
            FechaEntrega DATETIME,
            FechaLiq DATETIME,
            Saldo DECIMAL(18,2),
            Total DECIMAL(18,2),
            ExpiredDays INT
        );
        
        INSERT INTO @Ventas
        SELECT
            CONCAT(Id_Almacen, '-', TipoDoc, '-', TRIM(Serie), '-', Folio),
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
            DATEDIFF(DAY, GETDATE(), FechaEntrega)
        FROM [dbo].[VENTAS]
        WHERE Id_Cliente = @Id_Cliente
        AND Saldo > 0
        AND FechaLiq >= CAST(GETDATE() AS DATE)
        AND ( @FilterTipoDoc = 0 OR (TipoDoc = @TipoDoc AND @FilterTipoDoc = 1) )
        AND (@FilterExpired = 0 OR (DATEDIFF(DAY, GETDATE(), FechaEntrega) < 0 AND @FilterExpired = 1))
        AND (@FilterNotExpired = 0 OR (DATEDIFF(DAY, GETDATE(), FechaEntrega) > 0 AND @FilterNotExpired = 1))
        AND (@DateExactly IS NULL OR CAST(Fecha AS DATE) = @DateExactly)
        AND (@DateStart IS NULL OR CAST(Fecha AS DATE) >= @DateStart)
        AND (@DateEnd IS NULL OR CAST(Fecha AS DATE) <= @DateEnd);
        
        -- Totales
        SELECT 
            SUM(CASE WHEN ExpiredDays < 0 THEN Saldo ELSE 0 END) AS SaldoVencido,
            SUM(CASE WHEN ExpiredDays >= 0 OR ExpiredDays IS NULL THEN Saldo ELSE 0 END) AS SaldoNoVencido,
            SUM(Saldo) AS TotalSaldo
        FROM @Ventas;
    `
}

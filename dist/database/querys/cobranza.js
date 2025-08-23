"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.cobranzaQuery = void 0;
exports.cobranzaQuery = {
    getCobranza: `
        DECLARE @Ventas TABLE (
            Id_Cliente INT,
            Nombre NVARCHAR(200),
            Id_Almacen INT,
            ExpiredDays INT,
            Saldo DECIMAL(18,2),
            CorreoVtas NVARCHAR(100)
        );
        
        -- Insertar datos filtrados sin ningún cálculo adicional
        INSERT INTO @Ventas (Id_Cliente, Nombre, Id_Almacen, ExpiredDays, Saldo, CorreoVtas)
        SELECT
            V.Id_Cliente,
            C.RazonSocial AS Nombre,
            V.Id_Almacen,
            DATEDIFF(DAY, GETDATE(), DATEADD(DAY, CD.Dias, V.Fecha)) AS ExpiredDays,
            V.Saldo,
            ISNULL(C.CorreoVtas, '') AS CorreoVtas
        FROM [dbo].[VENTAS] V
        JOIN [dbo].[CLIENTES] C ON C.Id_Cliente = V.Id_Cliente AND C.Id_Almacen = V.Id_Almacen
        JOIN [dbo].[CONDVTAS] CD ON CD.Id_CondVta = V.Id_CondVta
        WHERE V.Saldo > 0
        AND V.Id_CondVta <> 1
        AND (@nombre = '' OR LOWER(C.RazonSocial) LIKE LOWER(@nombre) + '%');
        
        -- Totales por cliente y almacén
        WITH Totales AS (
            SELECT 
                Id_Cliente,
                Nombre,
                Id_Almacen,
                MAX(CorreoVtas) AS CorreoVtas,  -- Usar MAX para obtener un valor consistente de CorreoVtas
                SUM(CASE WHEN ExpiredDays < 0 THEN Saldo ELSE 0 END) AS SaldoVencido,
                SUM(CASE WHEN ExpiredDays >= 0 OR ExpiredDays IS NULL THEN Saldo ELSE 0 END) AS SaldoNoVencido,
                SUM(Saldo) AS TotalSaldo
            FROM @Ventas
            GROUP BY Id_Cliente, Nombre, Id_Almacen
        )
        
        -- Selección final con orden y paginación
        SELECT *
        FROM Totales
        ORDER BY
            CASE 
                WHEN @nombre <> '' AND LOWER(Nombre) LIKE LOWER(@nombre) + '%' THEN 0
                WHEN @nombre <> '' THEN 1
                ELSE 0
            END,
            CASE WHEN @OrderCondition = 'Nombre' THEN Nombre ELSE NULL END ASC,
            CASE WHEN @OrderCondition = 'ExpiredDays' THEN SaldoVencido ELSE NULL END DESC,
            CASE WHEN @OrderCondition = 'SaldoVencido' THEN SaldoVencido ELSE NULL END DESC,
            CASE WHEN @OrderCondition = 'SaldoNoVencido' THEN SaldoNoVencido ELSE NULL END DESC,
            CASE WHEN @OrderCondition = 'TotalSaldo' THEN TotalSaldo ELSE NULL END DESC,
            Id_Cliente,
            Nombre
            OFFSET (@PageNumber - 1) * @PageSize ROWS
            FETCH NEXT @PageSize ROWS ONLY
    `,
    getCobranzaTotal: `
        DECLARE @Ventas TABLE (
            Id_Cliente INT,
            Nombre NVARCHAR(200),
            Id_Almacen INT,
            ExpiredDays INT,
            Saldo DECIMAL(18,2),
            CorreoVtas NVARCHAR(100)
        );
        
        -- Insertar datos filtrados sin ningún cálculo adicional
        INSERT INTO @Ventas (Id_Cliente, Nombre, Id_Almacen, ExpiredDays, Saldo, CorreoVtas)
        SELECT
            V.Id_Cliente,
            C.RazonSocial AS Nombre,
            V.Id_Almacen,
            DATEDIFF(DAY, GETDATE(), DATEADD(DAY, CD.Dias, V.Fecha)) AS ExpiredDays,
            V.Saldo,
            ISNULL(C.CorreoVtas, '') AS CorreoVtas
        FROM [dbo].[VENTAS] V
        JOIN [dbo].[CLIENTES] C ON C.Id_Cliente = V.Id_Cliente AND C.Id_Almacen = V.Id_Almacen
        JOIN [dbo].[CONDVTAS] CD ON CD.Id_CondVta = V.Id_CondVta
        WHERE V.Saldo > 0
        AND V.Id_CondVta <> 1
        AND (@DateExactly IS NULL OR CAST(Fecha AS DATE) = @DateExactly)
        AND (@DateStart IS NULL OR CAST(Fecha AS DATE) >= @DateStart)
        AND (@DateEnd IS NULL OR CAST(Fecha AS DATE) <= @DateEnd)
        AND (@nombre = '' OR LOWER(C.RazonSocial) LIKE LOWER(@nombre) + '%');
            
        -- Totales por cliente y almacén
        WITH Totales AS (
            SELECT 
                Id_Cliente,
                Nombre,
                Id_Almacen,
                    CorreoVtas,  -- Usar MAX para obtener un valor consistente de CorreoVtas
                SUM(CASE WHEN ExpiredDays < 0 THEN Saldo ELSE 0 END) AS SaldoVencido,
                SUM(CASE WHEN ExpiredDays >= 0 OR ExpiredDays IS NULL THEN Saldo ELSE 0 END) AS SaldoNoVencido,
                SUM(Saldo) AS TotalSaldo
            FROM @Ventas
            GROUP BY Id_Cliente, Nombre, Id_Almacen, CorreoVtas
        )
        -- Suma final
        SELECT
            SUM(SaldoVencido) AS SumaSaldoVencido,
            SUM(SaldoNoVencido) AS SumaSaldoNoVencido,
            SUM(TotalSaldo) AS SumaTotalSaldo
        FROM Totales;
    `,
    getCobranzaCount: `
        WITH VentasFiltradas AS (
            SELECT
                V.Id_Cliente,
                C.RazonSocial AS Nombre,
                V.Id_Almacen
            FROM [dbo].[VENTAS] V
            JOIN [dbo].[CLIENTES] C ON C.Id_Cliente = V.Id_Cliente AND C.Id_Almacen = V.Id_Almacen
            WHERE V.Saldo > 0
            AND V.FechaLiq >= CAST(GETDATE() AS DATE)
            AND V.Id_CondVta <> 1
            AND (@nombre = '' OR LOWER(C.RazonSocial) LIKE LOWER(@nombre) + '%')
        )
        SELECT COUNT(*) AS TotalCount
        FROM (
            SELECT 
                Id_Cliente,
                Nombre,
                Id_Almacen
            FROM VentasFiltradas
            GROUP BY Id_Cliente, Nombre, Id_Almacen
        ) AS Agrupados;
    `,
    getCobranzaByClient: `
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
                FechaLiq,
                DATEADD(DAY, CD.Dias, V.Fecha) AS FechaExp,
                Saldo,
                Total,
                DATEDIFF(DAY, GETDATE(), DATEADD(DAY, CD.Dias, V.Fecha)) AS ExpiredDays
            FROM [dbo].[VENTAS] V
            JOIN [dbo].[CONDVTAS] CD ON CD.Id_CondVta = V.Id_CondVta
            WHERE Id_Cliente = @Id_Cliente  AND Id_Almacen = @Id_Almacen
                AND Saldo > 0 AND V.Id_CondVta <> 1
                AND FechaLiq >= CAST(GETDATE() AS DATE) -- Condición para FechaLiq
                AND (@FilterTipoDoc = 0 OR (TipoDoc = @TipoDoc AND @FilterTipoDoc = 1))
                AND (@FilterExpired = 0 OR (DATEDIFF(DAY, GETDATE(), FechaLiq) < 0 AND @FilterExpired = 1))
                AND (@FilterNotExpired = 0 OR (DATEDIFF(DAY, GETDATE(), FechaLiq) > 0 AND @FilterNotExpired = 1))
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
                WHEN @OrderCondition = 'ExpiredDays' THEN 
                    CASE WHEN ExpiredDays IS NULL THEN 1 ELSE 0 END
            END ASC,
            CASE 
                WHEN @OrderCondition = 'TipoDoc' THEN Fecha 
                WHEN @OrderCondition = 'ExpiredDays' THEN 
                    ExpiredDays -- Orden real de menor a mayor
                WHEN @OrderCondition = 'FechaLiq' THEN Fecha
            END ASC,
            Fecha,
            TipoDoc
            OFFSET (@PageNumber - 1) * @PageSize ROWS
            FETCH NEXT @PageSize ROWS ONLY
    `,
    getCobranzaByClientTotal: `
        WITH VENTAS_CTE
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
            FechaLiq,
            Saldo,
            Total,
            DATEDIFF(DAY, GETDATE(), DATEADD(DAY, CD.Dias, V.Fecha)) AS ExpiredDays

        FROM [dbo].[VENTAS] V
        JOIN [dbo].[CONDVTAS] CD ON CD.Id_CondVta = V.Id_CondVta
        WHERE Id_Cliente = @Id_Cliente  AND Id_Almacen = @Id_Almacen
            AND Saldo > 0 AND V.Id_CondVta <> 1
            AND FechaLiq >= CAST(GETDATE() AS DATE) -- Condición para FechaLiq
            AND (@FilterTipoDoc = 0 OR (TipoDoc = @TipoDoc AND @FilterTipoDoc = 1))
            AND (@FilterExpired = 0 OR (DATEDIFF(DAY, GETDATE(), FechaLiq) < 0 AND @FilterExpired = 1))
            AND (@FilterNotExpired = 0 OR (DATEDIFF(DAY, GETDATE(), FechaLiq) > 0 AND @FilterNotExpired = 1))
            AND (@DateExactly IS NULL OR CAST(Fecha AS DATE) = @DateExactly)
            AND (@DateStart IS NULL OR CAST(Fecha AS DATE) >= @DateStart)
            AND (@DateEnd IS NULL OR CAST(Fecha AS DATE) <= @DateEnd)
        )
        SELECT 
            SUM(CASE WHEN ExpiredDays < 0 THEN Saldo ELSE 0 END) AS SumaSaldoVencido,
            SUM(CASE WHEN ExpiredDays >= 0 OR ExpiredDays IS NULL THEN Saldo ELSE 0 END) AS SumaSaldoNoVencido,
            SUM(Saldo) AS SumaTotalSaldo
        FROM VENTAS_CTE;
    `,
    getCobranzaByClientCount: `
        SELECT COUNT(*) AS TotalCount
        FROM [dbo].[VENTAS] V
        JOIN [dbo].[CONDVTAS] CD ON CD.Id_CondVta = V.Id_CondVta
        WHERE Id_Cliente = @Id_Cliente  AND Id_Almacen = @Id_Almacen
        AND Saldo > 0 AND V.Id_CondVta <> 1
        AND FechaLiq >= CAST(GETDATE() AS DATE)
        AND (@FilterTipoDoc = 0 OR (TipoDoc = @TipoDoc AND @FilterTipoDoc = 1))
        AND (@FilterExpired = 0 OR (DATEDIFF(DAY, GETDATE(), FechaLiq) < 0 AND @FilterExpired = 1))
        AND (@FilterNotExpired = 0 OR (DATEDIFF(DAY, GETDATE(), FechaLiq) > 0 AND @FilterNotExpired = 1))
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
            FechaLiq,
            Saldo,
            Total,
            DATEDIFF(DAY, GETDATE(), FechaLiq)
        FROM [dbo].[VENTAS]
        WHERE Id_Cliente = @Id_Cliente
        AND Saldo > 0
        AND FechaLiq >= CAST(GETDATE() AS DATE)
        AND ( @FilterTipoDoc = 0 OR (TipoDoc = @TipoDoc AND @FilterTipoDoc = 1) )
        AND (@FilterExpired = 0 OR (DATEDIFF(DAY, GETDATE(), FechaLiq) < 0 AND @FilterExpired = 1))
        AND (@FilterNotExpired = 0 OR (DATEDIFF(DAY, GETDATE(), FechaLiq) > 0 AND @FilterNotExpired = 1))
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
};
//# sourceMappingURL=cobranza.js.map
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.statisticsQuery = void 0;
exports.statisticsQuery = {
    getEventsOfTheDay: `
        DECLARE @FechaEspecifica DATE = CONVERT(date, SYSDATETIMEOFFSET() AT TIME ZONE 'Central Standard Time (Mexico)');

        -- Reuniones y ventas del dia
        SELECT 
            ISNULL(BitacoraCount, 0) AS eventsToday,
            ISNULL(VentasCount, 0) AS sellsToday
        FROM (
            SELECT 
                (SELECT COUNT(*) 
                FROM dbo.BITACORACRM 
                WHERE Fecha >= @FechaEspecifica AND Fecha < DATEADD(DAY, 1, @FechaEspecifica)) AS BitacoraCount,
        
                (SELECT COUNT(*) 
                FROM dbo.VENTAS 
                WHERE Fecha >= @FechaEspecifica AND Fecha < DATEADD(DAY, 1, @FechaEspecifica)) AS VentasCount
        ) AS Counts;
        
        /* DECLARE @Hoy DATE = CAST(GETDATE() AS DATE);
        DECLARE @Hoy DATE = @FechaEspecifica;
        DECLARE @DiaSemana INT = DATEPART(WEEKDAY, @Hoy); -- 1 = domingo (por default, depende de @@DATEFIRST)
        DECLARE @FinDeSemana DATE; */
    `,
    getEventsOfTheWeek: `
        DECLARE @FechaEspecifica DATE = CONVERT(date, SYSDATETIMEOFFSET() AT TIME ZONE 'Central Standard Time (Mexico)');

        DECLARE @Hoy DATE = @FechaEspecifica;
        DECLARE @DiaSemana INT;
        DECLARE @FinDeSemana DATE;
        
        -- Normalizamos a que el domingo sea 7 (independientemente del DATEFIRST)
        SET @DiaSemana = DATEPART(WEEKDAY, @Hoy);
        SET @DiaSemana = CASE 
            WHEN @@DATEFIRST = 7 THEN CASE WHEN @DiaSemana = 1 THEN 7 ELSE @DiaSemana - 1 END
            ELSE @DiaSemana 
        END;
        
        -- Calculamos fecha del domingo de esta semana
        SET @FinDeSemana = DATEADD(DAY, (7 - @DiaSemana), @Hoy);
        
        -- Query de conteo total y por tabla
        SELECT 
            ISNULL(BitacoraCount, 0) AS eventsWeek,
            ISNULL(VentasCount, 0) AS sellsWeek,
            @Hoy AS FechaInicio,
            @FinDeSemana AS FechaFin
        FROM (
            SELECT 
                (SELECT COUNT(*) 
                FROM dbo.BITACORACRM 
                WHERE Fecha >= @Hoy AND Fecha < DATEADD(DAY, 1, @FinDeSemana)) AS BitacoraCount,
        
                (SELECT COUNT(*) 
                FROM dbo.VENTAS 
                WHERE Fecha >= @Hoy AND Fecha < DATEADD(DAY, 1, @FinDeSemana)) AS VentasCount
        ) AS Counts;
    `,
    getSellsOfTheMonth: `
        DECLARE @FechaBase DATE = CONVERT(date, SYSDATETIMEOFFSET() AT TIME ZONE 'Central Standard Time (Mexico)');

        -- Get the las 4 months
        WITH Meses AS (
            SELECT 
                n,
                Periodo = FORMAT(DATEADD(MONTH, -n, @FechaBase), 'yyyy-MM')
            FROM (VALUES (0), (1), (2), (3), (4), (5), (6)) AS v(n)
        ),
        -- Get the sells by month
        VentasPorMes AS (
            SELECT
                Periodo = FORMAT(DATEFROMPARTS(YEAR(V.Fecha), MONTH(V.Fecha), 1), 'yyyy-MM'),
                sellsTotal = SUM(v.Total),
                sellsByMonthContado = SUM(CASE WHEN V.Id_CondVta = 1 THEN V.Total ELSE 0 END),
                sellsByMonthCredit  = SUM(CASE WHEN V.Id_CondVta <> 1 THEN V.Total ELSE 0 END)
            FROM dbo.VENTAS AS V
            WHERE V.Saldo > 0
            GROUP BY DATEFROMPARTS(YEAR(V.Fecha), MONTH(V.Fecha), 1)
        )
        SELECT 
            m.Periodo AS period,
            ISNULL(v.sellsTotal ,0)       AS sellsTotal,
            ISNULL(v.sellsByMonthCredit ,0)       AS sellsByMonthCredit,
            ISNULL(v.sellsByMonthContado,0)       AS sellsByMonthContado
        FROM Meses AS m
        LEFT JOIN VentasPorMes AS v ON v.Periodo = m.Periodo
        ORDER BY m.Periodo DESC;
    `,
    getSellsOfToday: `
        DECLARE @FechaBase DATE = CONVERT(date, SYSDATETIMEOFFSET() AT TIME ZONE 'Central Standard Time (Mexico)');

        SELECT
            sellsTotal = SUM(v.Total),
            sellsByMonthContado = SUM(CASE WHEN V.Id_CondVta = 1 THEN V.Total ELSE 0 END),
            sellsByMonthCredit  = SUM(CASE WHEN V.Id_CondVta <> 1 THEN V.Total ELSE 0 END)
        FROM dbo.VENTAS AS V
        WHERE V.Fecha = @FechaBase
    `,
    getWeeklyAndForwardSaldo: `
        DECLARE @FechaBase DATE = CONVERT(date, SYSDATETIMEOFFSET() AT TIME ZONE 'Central Standard Time (Mexico)');

        /* 1. Rangos de tiempo */
        DECLARE @InicioMes  DATE = DATEFROMPARTS(YEAR(@FechaBase), MONTH(@FechaBase), 1);
        DECLARE @FinMes     DATE = EOMONTH(@FechaBase);        -- último día del mes
        
        /* 2. CTE base (sin cambios) */
        ;WITH VentasBase AS (
            SELECT
                V.Id_Cliente,
                C.RazonSocial  AS Nombre,
                V.Id_Almacen,
                V.Saldo,
                V.FechaLiq,
                DATEDIFF(DAY, @FechaBase, V.FechaLiq) AS ExpiredDays
            FROM dbo.VENTAS  V
            JOIN dbo.CLIENTES C
            ON C.Id_Cliente = V.Id_Cliente
            AND C.Id_Almacen = V.Id_Almacen
            WHERE V.Saldo > 0
        )
        
        /* 3. Resultado combinado */
        SELECT 
            'MES'  AS type,
            NULL AS sumCobranzaExpired,
            SUM(V.Saldo) AS sumCobranza
        FROM VentasBase V
        WHERE V.FechaLiq BETWEEN @InicioMes AND @FinMes
        
        UNION ALL
        
        SELECT
            'HOY' AS type,
            NULL  AS sumCobranzaExpired,
            SUM(V.Saldo) AS sumCobranza
        FROM VentasBase V
        WHERE CAST(V.FechaLiq AS DATE) = @FechaBase
        
        UNION ALL
        
        SELECT
            'HOY_FWD' AS type,
            SUM(CASE WHEN V.ExpiredDays < 0 THEN V.Saldo ELSE 0 END) AS sumCobranzaExpired,
            SUM(CASE WHEN V.ExpiredDays > 0 THEN V.Saldo ELSE 0 END) AS sumCobranza
        FROM VentasBase V
        
        UNION ALL
        
        SELECT
            'TOTAL' AS type,
            SUM(CASE WHEN V.ExpiredDays < 0 THEN V.Saldo ELSE 0 END) AS sumCobranzaExpired,
            SUM(V.Saldo) AS sumCobranza
        FROM VentasBase V
    `,
    getProductsAndSellersOfTheMonth: `
        SELECT 
            (SELECT COUNT(*) 
            FROM [dbo].[DETALLEVENTAS] dv
            WHERE dv.Folio IN (
                SELECT v.Folio
                FROM [dbo].[VENTAS] v
                WHERE v.Fecha >= '2023-05-01'
                AND v.Fecha <  '2025-05-24'
            )) AS TotalProductos,

            (SELECT COUNT(DISTINCT Id_Cliente)
            FROM [dbo].[VENTAS]
            WHERE Fecha >= '2023-05-01'
            AND Fecha <  '2025-05-24') AS TotalClientes;

        /* WHERE v.Fecha >= DATEFROMPARTS(YEAR(GETDATE()), MONTH(GETDATE()), 1)
            AND v.Fecha < DATEADD(DAY, 1, CAST(GETDATE() AS DATE)) */
    
    `
};
//# sourceMappingURL=statistics.js.map
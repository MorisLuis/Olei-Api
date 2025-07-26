

export const statisticsQuery = {

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
        WHERE V.Fecha >= @FechaBase AND V.Fecha <  DATEADD(DAY, 1, @FechaBase);
    `,

    getCobranzaStats: `
        DECLARE @FechaBase DATE = CONVERT(date, SYSDATETIMEOFFSET() AT TIME ZONE 'Central Standard Time (Mexico)');

        /* 1. Rangos de tiempo */
        DECLARE @InicioMes  DATE = DATEFROMPARTS(YEAR(@FechaBase), MONTH(@FechaBase), 1);
        DECLARE @FinMes     DATE = EOMONTH(@FechaBase);        -- último día del mes
        
        ;WITH VentasBase AS (
            SELECT
                V.Id_Cliente,
                V.Id_CondVta,
                C.RazonSocial  AS Nombre,
                V.Id_Almacen,
                V.Saldo,
                V.Fecha,
                V.FechaLiq,
                DATEDIFF(DAY, GETDATE(), DATEADD(DAY, CD.Dias, V.Fecha)) AS ExpiredDays
            FROM dbo.VENTAS  V
            JOIN dbo.CLIENTES C ON C.Id_Cliente = V.Id_Cliente AND C.Id_Almacen = V.Id_Almacen
            JOIN [dbo].[CONDVTAS] CD ON CD.Id_CondVta = V.Id_CondVta
            WHERE V.Saldo > 0
            AND V.Id_CondVta <> 1
        )

        SELECT
            'TOTAL' AS type,
            NULL AS sumCobranzaExpired,
            SUM(V.Saldo) AS sumCobranza
        FROM VentasBase V
        
        UNION ALL
        
        SELECT
            'DESGLOSE' AS type,
            SUM(CASE WHEN V.ExpiredDays < 0 THEN V.Saldo ELSE 0 END) AS sumCobranzaExpired,
            SUM(CASE WHEN V.ExpiredDays > 0 THEN V.Saldo ELSE 0 END) AS sumCobranza
        FROM VentasBase V
    `,

    getAbonosStats: `
        DECLARE @FechaBase DATE = CONVERT(date, SYSDATETIMEOFFSET() AT TIME ZONE 'Central Standard Time (Mexico)');

        /* 1. Rangos de tiempo */
        DECLARE @InicioMes  DATE = DATEFROMPARTS(YEAR(@FechaBase), MONTH(@FechaBase), 1);
        DECLARE @FinMes     DATE = EOMONTH(@FechaBase);        -- último día del mes

        ;WITH AbonosBase AS (
            SELECT TOP (1000) 
                Folio, 
                Fecha, 
                Importe, 
                Id_Cliente,
                Id_Almacen
            FROM [dbo].[ABONOS]
        )

        SELECT 
            'MES'  AS type,
            NULL AS sumCobranzaExpired,
            SUM(A.Importe) AS sumCobranza
        FROM AbonosBase A
        WHERE A.Fecha BETWEEN @InicioMes AND @FinMes

        UNION ALL

        SELECT
            'HOY' AS type,
            NULL  AS sumCobranzaExpired,
            SUM(A.Importe) AS sumCobranza
        FROM AbonosBase A
        WHERE CAST(A.Fecha AS DATE) = @FechaBase
    `
}
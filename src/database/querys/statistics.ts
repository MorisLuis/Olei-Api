

export const statisticsQuery = {

    getCRMBrief: `
        DECLARE @FechaEspecifica DATE = '2024-02-14'

        -- Conteo por tabla
        SELECT 
            ISNULL(BitacoraCount, 0) AS BitacoraCount,
            ISNULL(VentasCount, 0) AS VentasCount
        FROM (
            SELECT 
                (SELECT COUNT(*) 
                FROM dbo.BITACORACRM 
                WHERE Fecha >= @FechaEspecifica AND Fecha < DATEADD(DAY, 1, @FechaEspecifica)) AS BitacoraCount,

                (SELECT COUNT(*) 
                FROM dbo.VENTAS 
                WHERE Fecha >= @FechaEspecifica AND Fecha < DATEADD(DAY, 1, @FechaEspecifica)) AS VentasCount
        ) AS Counts;

        DECLARE @Hoy DATE = CAST(GETDATE() AS DATE);
        DECLARE @DiaSemana INT = DATEPART(WEEKDAY, @Hoy); -- 1 = domingo (por default, depende de @@DATEFIRST)
        DECLARE @FinDeSemana DATE;

        -- Ajustamos el fin de semana según el valor de @DATEFIRST
        -- Asumiendo @@DATEFIRST = 7 (domingo es 7, lunes es 1)
        -- Normalizamos a que el domingo sea 7
        SET @DiaSemana = DATEPART(WEEKDAY, @Hoy);
        SET @DiaSemana = CASE WHEN @@DATEFIRST = 7 THEN 
                                CASE WHEN @DiaSemana = 1 THEN 7 ELSE @DiaSemana - 1 END 
                            ELSE @DiaSemana END;

        -- Calculamos fecha del domingo de esta semana
        SET @FinDeSemana = DATEADD(DAY, (7 - @DiaSemana), @Hoy);

        -- Query de conteo total y por tabla
        SELECT 
            ISNULL(BitacoraCount, 0) AS BitacoraCount,
            ISNULL(VentasCount, 0) AS VentasCount,
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
    `

}
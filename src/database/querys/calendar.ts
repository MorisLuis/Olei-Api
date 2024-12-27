
export const celendarQuerys = {

    getCalendarTasksMonth: `
        SELECT
        Id_Cliente,
            Id_Bitacora,
            NULL AS Folio,
            NULL AS Id_Sell,
            Fecha,
            Titulo,
            'Bitacora' AS TableType
        FROM [dbo].[BITACORACRM]
        WHERE YEAR(Fecha) = @Anio
            AND MONTH(Fecha) = @Mes

        UNION ALL

        SELECT
        Id_Cliente,
            NULL AS Id_Bitacora,
            Folio,
            CONCAT(Id_Almacen, '-', TipoDoc, '-', TRIM(Serie), '-', Folio) AS Id_Sell,
            Fecha,
            CASE 
                    WHEN TipoDoc = 1 THEN 'Factura'
                    WHEN TipoDoc = 2 THEN 'Remision'
                    WHEN TipoDoc = 3 THEN 'Pedido'
                    ELSE 'Cotización'
                END AS Titulo,
            'Ventas' AS TableType
        FROM [dbo].[VENTAS]
        WHERE YEAR(Fecha) = @Anio
            AND MONTH(Fecha) = @Mes;
    `,

    getCalendarTasksDay: `
        SELECT
            Id_Bitacora,
            NULL AS Folio,
            NULL AS Id_Sell,
            Fecha,
            Titulo,
            'Bitacora' AS TableType,
            Hour,
            HourEnd
        FROM [dbo].[BITACORACRM]
        WHERE CAST(Fecha AS DATE) = @FechaEspecifica

        UNION ALL

        SELECT
            NULL AS Id_Bitacora,
            Folio,
            CONCAT(Id_Almacen, '-', TipoDoc, '-', TRIM(Serie), '-', Folio) AS Id_Sell,
            Fecha,
            CASE 
            WHEN TipoDoc = 1 THEN 'Factura'
            WHEN TipoDoc = 2 THEN 'Remision'
            WHEN TipoDoc = 3 THEN 'Pedido'
            ELSE 'Cotización'
        END AS Titulo,
            'Ventas' AS TableType,
            NULL AS Hour, -- Columna Hour no existe en Ventas, se usa NULL
            NULL AS HourEnd
        -- Columna HourEnd no existe en Ventas, se usa NULL
        FROM [dbo].[VENTAS]
        WHERE CAST(Fecha AS DATE) = @FechaEspecifica;
    `,

    getCalendarTasksMonthByClient: `
        SELECT Fecha, Titulo, 'Bitacora' AS TableType
        FROM [dbo].[BITACORACRM]
        WHERE YEAR(Fecha) = @Anio
        AND MONTH(Fecha) = @Mes
        AND Id_Cliente = @Id_Cliente

        UNION ALL

        SELECT Fecha, 
            CASE 
                WHEN TipoDoc = 1 THEN 'Factura'
                WHEN TipoDoc = 2 THEN 'Remision'
                WHEN TipoDoc = 3 THEN 'Pedido'
                ELSE 'Cotización'
            END AS Titulo, 
            'Ventas' AS TableType
        FROM [dbo].[VENTAS]
        WHERE YEAR(Fecha) = @Anio
        AND MONTH(Fecha) = @Mes
        AND Id_Cliente = @Id_Cliente
    `
}

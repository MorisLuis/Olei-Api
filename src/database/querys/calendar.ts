
export const celendarQuerys = {

    getCalendarTasksMonth: `
        SELECT
            Id_Cliente,
            Id_Bitacora,
            Descripcion,
            NULL AS Folio,
            NULL AS Id_Sell,
            Fecha,
            Titulo,
            'Bitacora' AS TableType
        FROM [dbo].[BITACORACRM]
        WHERE YEAR(Fecha) = @Anio
            AND MONTH(Fecha) = @Mes
    `,

    /* getCalendarTasksMonth: `
        SELECT
            Id_Cliente,
            Id_Bitacora,
            Descripcion,
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
            NULL AS Descripcion,
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
    `, */

    getCalendarTasksByDay: `
        SELECT
            Id_Cliente,
            Id_Bitacora,
            Descripcion,
            NULL AS Folio,
            NULL AS Id_Sell,
            Fecha,
            Titulo,
            'Bitacora' AS TableType,
            Hour,
            HourEnd
        FROM [dbo].[BITACORACRM]
        WHERE CAST(Fecha AS DATE) = @FechaEspecifica 
        AND (@Id_Cliente IS NULL OR Id_Cliente = @Id_Cliente)

        UNION ALL

        SELECT
            V.Id_Cliente,
            NULL AS Id_Bitacora,
            NULL AS Descripcion,
            V.Folio,
            CONCAT(V.Id_Almacen, '-', V.TipoDoc, '-', TRIM(V.Serie), '-', V.Folio) AS Id_Sell,
            V.Fecha,
            CASE 
                WHEN V.TipoDoc = 1 THEN 'Factura'
                WHEN V.TipoDoc = 2 THEN 'Remision'
                WHEN V.TipoDoc = 3 THEN 'Pedido'
                ELSE 'Cotización'
            END AS Titulo,
            'Ventas' AS TableType,
            NULL AS Hour,
            NULL AS HourEnd
        FROM [dbo].[VENTAS] V
        JOIN [dbo].[CONDVTAS] CD ON CD.Id_CondVta = V.Id_CondVta
        WHERE DATEADD(DAY, CD.Dias, V.Fecha) < DATEADD(DAY, 1, @FechaEspecifica)
        AND (@Id_Cliente IS NULL OR Id_Cliente = @Id_Cliente)
        ORDER BY Fecha DESC
        OFFSET (@Page - 1) * @limit ROWS
        FETCH NEXT @limit ROWS ONLY;

        SELECT COUNT(*) AS TotalBitacora
        FROM [dbo].[BITACORACRM]
        WHERE CAST(Fecha AS DATE) = @FechaEspecifica 
        AND (@Id_Cliente IS NULL OR Id_Cliente = @Id_Cliente);

        SELECT COUNT(*) AS TotalVentas
        FROM [dbo].[VENTAS]
        WHERE Fecha < DATEADD(DAY, 1, @FechaEspecifica) 
        AND (@Id_Cliente IS NULL OR Id_Cliente = @Id_Cliente);

    `,

    getCalendarTasksMonthByClient: `
        SELECT
            Id_Cliente,
            Id_Bitacora,
            Descripcion,
            NULL AS Folio,
            NULL AS Id_Sell,
            Fecha,
            Titulo,
            'Bitacora' AS TableType
        FROM [dbo].[BITACORACRM]
        WHERE YEAR(Fecha) = @Anio
            AND MONTH(Fecha) = @Mes
            AND Id_Cliente = @Id_Cliente

        UNION ALL

        SELECT
            Id_Cliente,
            NULL AS Id_Bitacora,
            NULL AS Descripcion,
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
            AND MONTH(Fecha) = @Mes
            AND Id_Cliente = @Id_Cliente
    `

}

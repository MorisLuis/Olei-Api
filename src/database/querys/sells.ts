
export const sellsQuery = {

    // Quote, Remission or Invoice.
    getSells: `
        SELECT
            CONCAT(C.Id_Almacen, '-', C.Id_Cliente, '-', V.TipoDoc, '-', TRIM(V.Serie), '-', V.Folio) AS UniqueKey,
            C.Id_Cliente,
            V.Id_Almacen,
            C.Nombre,
            SUM(V.Saldo) AS Saldo,
            SUM(V.Total) AS Total
        FROM [dbo].[CLIENTES] AS C
        INNER JOIN [dbo].[VENTAS] AS V ON C.Id_Cliente = V.Id_Cliente AND C.Id_Almacen = V.Id_Almacen
        WHERE V.Saldo > 0
        GROUP BY 
            C.Id_Cliente,
            C.Id_Almacen,
            C.Nombre,
            V.Id_Almacen,
            V.TipoDoc,
            V.Serie,
            V.Folio
        ORDER BY 
            CASE WHEN @OrderCondition = 'Total' THEN SUM(V.Total) END DESC,
            CASE WHEN @OrderCondition = 'Saldo' THEN SUM(V.Saldo) END DESC,
            CASE WHEN @OrderCondition = 'Nombre' THEN C.Nombre END,
            C.Id_Cliente,
            V.Id_Almacen,
            V.TipoDoc,
            V.Serie,
            V.Folio
        OFFSET (@PageNumber - 1) * @PageSize ROWS
        FETCH NEXT @PageSize ROWS ONLY
    `,

    getSellsByClient: `
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
        ORDER BY 
            CASE WHEN @OrderCondition = 'TipoDoc' THEN TipoDoc END DESC,
            CASE WHEN @OrderCondition = 'Folio' THEN Folio END DESC,
            CASE WHEN @OrderCondition = 'Fecha' THEN Fecha END DESC,
            CASE WHEN @OrderCondition = 'FechaEntrega' THEN FechaEntrega END DESC,
            CASE WHEN @OrderCondition = 'ExpiredDays' THEN DATEDIFF(DAY, GETDATE(), FechaEntrega) END DESC,
            TipoDoc
        OFFSET (@PageNumber - 1) * @PageSize ROWS
        FETCH NEXT @PageSize ROWS ONLY;
    `,

    getSellById: `
        SELECT Id_Cliente, Id_Almacen, TipoDoc, Folio, Serie, Fecha, FechaEntrega, Saldo, Total, Subtotal, Impuesto, FechaLiq, Estado, Piezas
        FROM dbo.VENTAS
        WHERE Id_Almacen = @Id_Almacen AND TipoDoc = @TipoDoc AND Serie = @Serie AND Folio = @Folio
    `
}
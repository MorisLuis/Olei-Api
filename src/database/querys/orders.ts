// This is the table "VENTAS" and "DETALLESDEVENTAS".
export const orderQuerys = {

    // Order
    getOrder: ` 
        SELECT V.Folio, V.Piezas, V.Subtotal, V.Impuesto, V.Total, V.Fecha, C.Nombre as Cliente, VE.Nombre as Vendedor
        FROM [dbo].[VENTAS] AS V
        LEFT JOIN [dbo].[CLIENTES] AS C ON V.Id_Cliente = C.Id_Cliente AND V.Id_Almacen = C.Id_Almacen
        LEFT JOIN [dbo].[VENDEDORES] AS VE ON V.Id_Vendedor = VE.Id_Vendedor
        WHERE  V.Folio = @folio
    `,

    getAllOrders: `
        SELECT V.Folio, V.Piezas, V.Subtotal, V.Impuesto, V.Total, V.Fecha, V.Id_Cliente, C.Nombre as Cliente, VE.Nombre as Vendedor
        FROM [dbo].[VENTAS] AS V
        LEFT JOIN [dbo].[CLIENTES] AS C ON V.Id_Cliente = C.Id_Cliente AND V.Id_Almacen = C.Id_Almacen
        LEFT JOIN [dbo].[VENDEDORES] AS VE ON V.Id_Vendedor = VE.Id_Vendedor
        ORDER BY Folio DESC
        OFFSET (@PageNumber - 1) * @PageSize ROWS
        FETCH NEXT @PageSize ROWS ONLY
    `,

    getTotalAllOrders: `
        SELECT COUNT(*) AS TotalCount
        FROM [dbo].[VENTAS] AS V
        LEFT JOIN [dbo].[CLIENTES] AS C ON V.Id_Cliente = C.Id_Cliente AND V.Id_Almacen = C.Id_Almacen
        LEFT JOIN [dbo].[VENDEDORES] AS VE ON V.Id_Vendedor = VE.Id_Vendedor
    `,

    // Order Details
    getOrderDetails: `
        SELECT 
            D.Precio,
            D.Cantidad,
            D.Importe,
            D.Impuesto,
            D.Id_Marca,
            D.Id_Almacen,
            D.Id_ListaPrecios,
            D.Folio,
            TRIM(D.Descripcion) AS Descripcion,
            TRIM(D.Codigo) AS Codigo,
            E.Existencia,
            F.Nombre AS Marca,
            U.Nombre as Unidad
        FROM [dbo].[DETALLEVENTAS] AS D
        INNER JOIN [dbo].[EXISTENCIAS] AS E ON D.Codigo = E.Codigo AND D.Id_Marca = E.Id_Marca AND D.Id_Almacen = E.Id_Almacen
        INNER JOIN [dbo].[MARCAS] AS F ON D.Id_Marca = F.Id_Marca
        INNER JOIN [dbo].[UNIDADES] AS U ON D.Id_Unidad = U.Id_Unidad
        WHERE Folio = @folio
        ORDER BY Folio DESC
        OFFSET (@PageNumber - 1) * @PageSize ROWS
        FETCH NEXT @PageSize ROWS ONLY
    `,

    getTotalOrderDetails: `
        SELECT COUNT(*) AS TotalCount
        FROM [dbo].[DETALLEVENTAS] AS D
        INNER JOIN [dbo].[EXISTENCIAS] AS E ON D.Codigo = E.Codigo AND D.Id_Marca = E.Id_Marca AND D.Id_Almacen = E.Id_Almacen
        INNER JOIN [dbo].[MARCAS] AS F ON D.Id_Marca = F.Id_Marca
        WHERE Folio = @folio
    `,
}
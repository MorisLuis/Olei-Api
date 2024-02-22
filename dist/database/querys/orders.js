"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.orderQuerys = void 0;
// This is the table "VENTAS" and "DETALLESDEVENTAS".
exports.orderQuerys = {
    // Order
    getPreviewDataToPostOrder: `
        SELECT 
        (
            SELECT TOP 1 Folio FROM [dbo].[VENTAS]
            WHERE Folio = (SELECT MAX(Folio) FROM [dbo].[VENTAS])
        ) AS Folio,
        (
            SELECT SerieActiva FROM [dbo].[DATOSFISCALES]
            WHERE Id_Almacen = @Id_Almacen_Preview
        ) AS SerieActiva,
        Id_Descuento, Id_CondVta, Id_Vendedor, Id_FormaPago, Id_Transporte
        FROM [dbo].[CLIENTES]
        WHERE Id_Cliente = @Id_Cliente_Preview AND Id_Almacen = @Id_Almacen_Preview
    `,
    getOrder: ` 
        SELECT V.Folio, V.Piezas, V.Subtotal, V.Impuesto, V.Total, V.Fecha, C.Nombre as Cliente, VE.Nombre as Vendedor
        FROM [dbo].[VENTAS] AS V
        INNER JOIN [dbo].[CLIENTES] AS C ON V.Id_Cliente = C.Id_Cliente AND V.Id_Almacen = C.Id_Almacen
        INNER JOIN [dbo].[VENDEDORES] AS VE ON V.Id_Vendedor = VE.Id_Vendedor
        WHERE V.Id_Cliente = @Id_Cliente AND V.TipoDoc = @TipoDocOO AND V.Folio = @folio
    `,
    getAllOrders: `
        SELECT V.Folio, V.Piezas, V.Subtotal, V.Impuesto, V.Total, V.Fecha ,C.Nombre as Cliente, VE.Nombre as Vendedor
        FROM [dbo].[VENTAS] AS V
        INNER JOIN [dbo].[CLIENTES] AS C ON V.Id_Cliente = C.Id_Cliente AND V.Id_Almacen = C.Id_Almacen
        INNER JOIN [dbo].[VENDEDORES] AS VE ON V.Id_Vendedor = VE.Id_Vendedor
        WHERE V.Id_Cliente = @Id_Cliente AND TipoDoc = @TipoDocOO
        ORDER BY Fecha DESC
    `,
    insertOrder: ` 
        INSERT INTO [dbo].[VENTAS]  (
            Id_Cliente, Id_Almacen, Id_AlmacenClte, TipoDoc, Serie, Folio, Fecha,
            Subtotal, Impuesto, Total, Saldo, Id_Descuento, Id_CondVta, Id_Vendedor, Id_Formapago,
            Id_Transporte, FechaLiq, Estado, Piezas, Moneda, Paridad, CantDescuento,
            Suma, Id_Usuario, Id_ListPre, CantLetra, FechaEntrega
        ) 
        OUTPUT 'Order' as 'result', Inserted.Id_Almacen, Inserted.Folio, Inserted.Fecha, Inserted.Id_Cliente 
        VALUES (
            @Id_Cliente, @Id_Almacen, @Id_AlmacenClte, @TipoDoc, @Serie, @Folio, @Fecha,
            @Subtotal, @Impuesto, @Total, @Saldo, @Id_Descuento, @Id_CondVta, @Id_Vendedor, @Id_Formapago,
            @Id_Transporte, @FechaLiq, @Estado, @Piezas, @Moneda, @Paridad, @CantDescuento,
            @Suma, @Id_Usuario, @Id_ListPre, @CantLetra, @FechaEntrega
        )
    `,
    // Order Details
    getPreviewDataToPostOrderDetails: `
        SELECT 
            (SELECT TOP 1 Folio FROM [dbo].[VENTAS] WHERE Folio = (SELECT TOP 1 Folio FROM [dbo].[VENTAS] ORDER BY Folio DESC)) AS Folio,
            (SELECT Costo FROM [dbo].[COSTOS] WHERE TRIM(Codigo) = @Codigo_Preview AND Id_Marca = @Id_Marca_Preview) AS Costo,
            (SELECT TRIM(SerieActiva) FROM [dbo].[DATOSFISCALES] WHERE Id_Almacen = @Id_Almacen_Preview) AS SerieActiva,
            (SELECT Id_Descuento FROM [dbo].[CLIENTES] WHERE Id_Cliente = @Id_Cliente_Preview AND Id_Almacen = @Id_Almacen_Preview) AS Id_Descuento,
            (SELECT Valor FROM [dbo].[DESCUENTOS] WHERE Id_Descuento = (SELECT Id_Descuento FROM [dbo].[CLIENTES] WHERE Id_Cliente = @Id_Cliente_Preview AND Id_Almacen = @Id_Almacen_Preview)) AS Valor,
            P.SwNs,
            TRIM(P.SKU) AS SKU,
            P.Id_Unidad AS Id_Unidad
        FROM [dbo].[PRODUCTOS] AS P
        WHERE TRIM(P.Codigo) = @Codigo_Preview
    `,
    getOrderDetails: `
        SELECT D.Precio, D.Cantidad as Piezas, D.Importe, D.Impuesto, D.Id_Marca, D.Id_Almacen, D.Id_ListaPrecios, D.Folio, TRIM(D.Descripcion) AS Descripcion, TRIM(D.Codigo) AS Codigo, E.Existencia, F.Nombre AS Marca
        FROM [dbo].[DETALLEVENTAS] AS D
        INNER JOIN [dbo].[EXISTENCIAS] AS E ON D.Codigo = E.Codigo AND D.Id_Marca = E.Id_Marca AND D.Id_Almacen = E.Id_Almacen
        INNER JOIN [dbo].[MARCAS] AS F ON D.Id_Marca = F.Id_Marca
        WHERE Folio = @folio
        ORDER BY Folio DESC
    `,
    insertOrderDetails: ` 
        INSERT INTO [dbo].[DETALLEVENTAS]  (
            Id_Almacen, TipoDoc, Serie, Folio, Codigo, Id_Marca, Id_ListaPrecios, Cantidad,
            Precio, Importe, Impuesto, Descripcion, Descuento, Id_Unidad, SwNs, TasaImpuesto, SKU, Partida, Costo
        ) 
        OUTPUT 'OrderDetails' as 'result', Inserted.Id_Almacen, Inserted.Folio, TRIM(Inserted.Codigo) AS Codigo, Inserted.Cantidad 
        VALUES (
            @Id_Almacen, @TipoDoc, @Serie, @Folio, @Codigo, @Id_Marca, @Id_ListaPrecios, @Cantidad,
            @Precio, @Importe, @Impuesto, @Descripcion, @Descuento, @Id_Unidad, @SwNs, @TasaImpuesto, @SKU, @Partida,  @Costo
        );
    `,
};
//# sourceMappingURL=orders.js.map
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.querys = void 0;
exports.querys = {
    //Auth
    auth: ` 
        SELECT U.*, UC.SwImagenes, UC.SwSinStock, UC.SwsinPrecio, UC.TipoDocOO, UC.IdOLEI,
        TRIM(UC.Nombre) AS Company
        FROM [OLEIDB1_CLIENTES].[dbo].[USUARIOSOOL] U
        JOIN [OLEIDB1_CLIENTES].[dbo].[CLIENTES] UC on U.Id_ClienteDBCLIENTES = UC.Id_Cliente
        WHERE U.Id_UsuarioOOL = @email
    `,
    authCompany: ` 
        SELECT C.Id_ListPre, C.Nombre, CS.PrecioIncIVA
        FROM [dbo].[CLIENTES] C
        JOIN [dbo].[CONFIGSIST] CS ON C.IdOLEI = @IdOLEI
        WHERE Id_Cliente = @Id_Cliente
    `,
    // Products
    getAllProducts: `
        SELECT DISTINCT
        TRIM(P.Descripcion) AS Descripcion,
        TRIM(P.Codigo) AS Codigo,
        E.Existencia,
        E.Id_Almacen,
        M.Id_Marca,
        TRIM(M.Nombre) AS Marca,
        PR.Id_ListaPrecios,

        P.Id_Familia,
        TRIM(F.Nombre) AS Familia,
        TRIM(PR.Codigo) AS CodigoPrecio,
        PR.Precio,
        TRIM(E.Codigo) AS CodigoExistencia,
        CT.Impto AS Impuesto

        FROM [dbo].[PRODUCTOS] P
        JOIN [dbo].[FAMILIAS] F ON P.Id_Familia = F.Id_Familia
        JOIN [dbo].[PRECIOS] PR ON P.Codigo = PR.Codigo
        JOIN [dbo].[EXISTENCIAS] E ON P.Codigo = E.Codigo AND PR.Id_Marca = E.Id_Marca
        JOIN [dbo].[MARCAS] M ON PR.Id_Marca = M.Id_Marca
        JOIN [dbo].[COSTOS] CT ON P.Codigo = CT.Codigo AND PR.Id_Marca = CT.Id_Marca
        WHERE PR.Id_ListaPrecios = @ListaPrecios AND E.Id_Almacen = @Almacen
    `,
    getProductsBySearch: `
        SELECT DISTINCT TRIM(P.Descripcion) AS Descripcion 
        FROM [dbo].[PRODUCTOS] P
        JOIN [dbo].[PRECIOS] PR ON P.Codigo = PR.Codigo
        JOIN [dbo].[EXISTENCIAS] E ON P.Codigo = E.Codigo AND PR.Id_Marca = E.Id_Marca
    `,
    getProductsBySearchInventory: `
        SELECT TOP(20)
            TRIM(P.Descripcion) AS Descripcion,
            TRIM(P.Codigo) AS Codigo,
            E.Existencia,
            E.Id_Almacen,
            M.Id_Marca,
            TRIM(M.Nombre) AS Marca,
            P.Id_Familia AS Id_Familia,
            TRIM(F.Nombre) AS Familia,
            TRIM(PR.Codigo) AS CodigoPrecio,
            PR.Id_ListaPrecios,
            PR.Precio AS Precio
        FROM [dbo].[PRODUCTOS] P
        JOIN [dbo].[FAMILIAS] F ON P.Id_Familia = F.Id_Familia
        JOIN [dbo].[PRECIOS] PR ON P.Codigo = PR.Codigo
        JOIN [dbo].[EXISTENCIAS] E ON P.Codigo = E.Codigo AND PR.Id_Marca = E.Id_Marca
        JOIN [dbo].[COSTOS] C ON P.Codigo = C.Codigo AND PR.Id_Marca = C.Id_Marca
        JOIN [dbo].[MARCAS] M ON PR.Id_Marca = M.Id_Marca
        WHERE LOWER(P.Descripcion) LIKE '%' + LOWER(@searchTerm) + '%'
        ORDER BY P.Codigo
    `,
    getProducById: `
        SELECT
            TRIM(P.Descripcion) AS Descripcion,
            TRIM(P.Codigo) AS Codigo,
            E.Existencia,
            E.Id_Almacen,
            M.Id_Marca,
            TRIM(M.Nombre) AS Marca,
            PR.Id_ListaPrecios,
            P.Id_Familia,
            TRIM(F.Nombre) AS Familia,
            TRIM(PR.Codigo) AS CodigoPrecio,
            PR.Precio,
            TRIM(E.Codigo) AS CodigoExistencia,
            CT.Impto AS Impuesto,
            P.Observaciones,
            TRIM(CT.CodBar) AS CodBar
            FROM [dbo].[PRODUCTOS] P
            JOIN [dbo].[FAMILIAS] F ON P.Id_Familia = F.Id_Familia
            JOIN [dbo].[PRECIOS] PR ON P.Codigo = PR.Codigo
            JOIN [dbo].[EXISTENCIAS] E ON P.Codigo = E.Codigo AND PR.Id_Marca = E.Id_Marca
            JOIN [dbo].[MARCAS] M ON PR.Id_Marca = M.Id_Marca
            JOIN [dbo].[COSTOS] CT ON P.Codigo = CT.Codigo AND PR.Id_Marca = CT.Id_Marca
            WHERE P.Codigo = @Codigo AND M.Nombre = @Marca AND PR.Id_ListaPrecios = @ListaPrecios AND E.Id_Almacen = @Almacen
    `,
    getTotalProducts: "SELECT COUNT(*) FROM [dbo].[CLIENTES]",
    // Users
    getAllUsers: "SELECT TOP(500) * FROM [OLEIDB1_CLIENTES].[dbo].[USUARIOS]",
    getUser: "SELECT * FROM [OLEIDB1_CLIENTES].[dbo].[USUARIOS] WHERE Nombre = ?",
    // Tables
    getFamilias: `SELECT TRIM(F.Nombre) AS Nombre FROM [dbo].[FAMILIAS] F`,
    getMarcas: `SELECT TRIM(M.Nombre) AS Nombre FROM [dbo].[MARCAS] M`,
    getFolios: `SELECT TRIM(P.Codigo) AS Codigo FROM [dbo].[PRODUCTOS] P`,
    // Clients
    getClientBySearch: `
        SELECT TOP(20) TRIM(C.Nombre) AS Nombre, C.Id_Cliente, C.Id_Almacen, C.Id_ListPre
        FROM [dbo].[CLIENTES] C
    `,
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
    // Products by stock
    getAllProductsByStock: `
        SELECT
            TRIM(P.Descripcion) AS Descripcion,
            TRIM(P.Codigo) AS Codigo,
            E.Existencia,
            E.Id_Almacen,
            M.Id_Marca,
            TRIM(M.Nombre) AS Marca,
            PR.Id_ListaPrecios,
            TRIM(C.CodBar) AS CodBar
        FROM [dbo].[PRODUCTOS] P
        JOIN [dbo].[FAMILIAS] F ON P.Id_Familia = F.Id_Familia
        JOIN [dbo].[PRECIOS] PR ON P.Codigo = PR.Codigo
        JOIN [dbo].[EXISTENCIAS] E ON P.Codigo = E.Codigo AND PR.Id_Marca = E.Id_Marca
        JOIN [dbo].[COSTOS] C ON P.Codigo = C.Codigo AND PR.Id_Marca = C.Id_Marca
        JOIN [dbo].[MARCAS] M ON PR.Id_Marca = M.Id_Marca
        ORDER BY P.Codigo
        OFFSET (@PageNumber - 1) * @PageSize ROWS
        FETCH NEXT @PageSize ROWS ONLY
    `,
    getProductByStockAndCodeBar: `
    SELECT TRIM(P.Descripcion) AS Descripcion, TRIM(P.Codigo) AS Codigo, E.Existencia, E.Id_Almacen, C.Id_Marca, TRIM(C.CodBar) AS CodBar, TRIM(M.Nombre) AS Marca
    FROM [dbo].[PRODUCTOS] P
        JOIN [dbo].[EXISTENCIAS] E ON P.Codigo = E.Codigo
        JOIN [dbo].[COSTOS] C ON C.Codigo = P.Codigo
        JOIN [dbo].[MARCAS] M ON E.Id_Marca = M.Id_Marca
        WHERE C.CodBar = @CodeBar
    `,
    // Inventory
    getInventory: `SELECT I.Folio, I.Fecha FROM [dbo].[INVENTARIOS] I WHERE I.Folio = @Folio`,
    insertInventory: ` 
        INSERT INTO [dbo].[INVENTARIOS]  (
            Id_Almacen, Folio, Id_TipoMovInv, Estado, Fecha, Id_AlmacenDest, SwPendiente, Descripcion, Id_Usuario, SwTr, FechaRecepcion, FolioReq, AlmReq
        ) 
        OUTPUT 'Inventory' as 'result', Inserted.Id_Almacen, Inserted.Folio, Inserted.Fecha, Inserted.Id_TipoMovInv 
        VALUES (
            @Id_Almacen, @Folio, @Id_TipoMovInv, @Estado, @Fecha, @Id_AlmacenDest, @SwPendiente, @Descripcion, @Id_Usuario, @SwTr, @FechaRecepcion, @FolioReq, @AlmReq
        )
    `,
    getInventoryDetails: `SELECT I.Folio, TRIM(I.Codigo) AS Codigo, I.Cantidad, I.Partida FROM [dbo].[DETALLEINVENTARIOS] I  WHERE I.Folio = @Folio`,
    insertInventoryDetails: ` 
        INSERT INTO [dbo].[DETALLEINVENTARIOS] (
            Id_Almacen, Folio, Partida, Codigo, Id_Marca, Cantidad, Id_Ubicacion, Diferencia, SwNS, NumsDeSerie, SKU
        ) 
        OUTPUT 'output' as 'result', Inserted.Id_Almacen, Inserted.Folio, Inserted.Partida, Inserted.Codigo 
        VALUES (
            @Id_Almacen, @Folio, @Partida, @Codigo, @Id_Marca, @Cantidad, @Id_Ubicacion, @Diferencia, @SwNS, @NumsDeSerie, @SKU
        )
    `,
    updateExistenceTable: ` 
        DECLARE @UpdatedData TABLE (
            Id_Almacen INT,
            ExistenciaAnt INT,
            Existencia INT,
            Codigo NVARCHAR(255)
        )
        UPDATE [dbo].[EXISTENCIAS]
        SET Existencia = Existencia + @Cantidad_Existence, ExistenciaAnt = Existencia, Diferencia = @Cantidad_Existence
        OUTPUT INSERTED.Id_Almacen, INSERTED.ExistenciaAnt, INSERTED.Existencia, INSERTED.Codigo INTO @UpdatedData
        WHERE Codigo = @Codigo_Existence AND Id_Marca = @Id_Marca_Existence AND Id_Almacen = @Id_Almacen_Existence
        SELECT * FROM @UpdatedData;
    `,
};
//# sourceMappingURL=querys.js.map
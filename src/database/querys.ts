export const querys = {

    //Auth
    auth: ` 
        SELECT U.*, UC.SwImagenes, UC.SwSinStock, UC.SwsinPrecio, UC.TipoDocOO,
        TRIM(UC.Nombre) AS Company
        FROM [OLEIDB1_CLIENTES].[dbo].[USUARIOSOOL] U
        JOIN [OLEIDB1_CLIENTES].[dbo].[CLIENTES] UC on U.Id_ClienteDBCLIENTES = UC.Id_Cliente
        WHERE U.Id_UsuarioOOL = @email
    `,

    authCompany: ` 
        SELECT C.Id_ListPre, C.Nombre, CS.PrecioIncIVA
        FROM [@database].[dbo].[CLIENTES] C
        JOIN [@database].[dbo].[CONFIGSIST] CS ON C.IdOLEI = 1
        WHERE Id_Cliente = @Id_Cliente
    ` ,

    // Products
    getAllProducts: `
        SELECT DISTINCT
        TRIM(P.Descripcion) AS Descripcion,
        P.Id_Familia,
        TRIM(P.Codigo) AS Codigo,
        TRIM(F.Nombre) AS Familia,
        TRIM(PR.Codigo) AS CodigoPrecio,
        PR.Precio,
        TRIM(E.Codigo) AS CodigoExistencia,
        E.Existencia,
        E.Id_Almacen,
        TRIM(M.Nombre) AS Marca,
        M.Id_Marca,
        PR.Id_ListaPrecios,
        CT.Impto AS Impuesto
        FROM [OLEIDB1].[dbo].[PRODUCTOS] P
        JOIN [OLEIDB1].[dbo].[FAMILIAS] F ON P.Id_Familia = F.Id_Familia
        JOIN [OLEIDB1].[dbo].[PRECIOS] PR ON P.Codigo = PR.Codigo
        JOIN [OLEIDB1].[dbo].[EXISTENCIAS] E ON P.Codigo = E.Codigo AND PR.Id_Marca = E.Id_Marca
        JOIN [OLEIDB1].[dbo].[MARCAS] M ON PR.Id_Marca = M.Id_Marca
        JOIN [OLEIDB1].[dbo].[COSTOS] CT ON P.Codigo = CT.Codigo AND PR.Id_Marca = CT.Id_Marca
        WHERE PR.Id_ListaPrecios = @ListaPrecios AND E.Id_Almacen = @Almacen
    `,

    getProductsBySearch: `
        SELECT DISTINCT TRIM(P.Descripcion) AS Descripcion 
        FROM [OLEIDB1].[dbo].[PRODUCTOS] P
        JOIN [OLEIDB1].[dbo].[PRECIOS] PR ON P.Codigo = PR.Codigo
        JOIN [OLEIDB1].[dbo].[EXISTENCIAS] E ON P.Codigo = E.Codigo AND PR.Id_Marca = E.Id_Marca
    `,

    getProducById: `
    SELECT
        TRIM(P.Descripcion) AS Descripcion,
        P.Id_Familia,
        TRIM(P.Codigo) AS Codigo,
        P.Observaciones,
        TRIM(F.Nombre) AS Familia,
        TRIM(PR.Codigo) AS CodigoPrecio,
        PR.Precio,
        TRIM(E.Codigo) AS CodigoExistencia,
        E.Existencia,
        E.Id_Almacen,
        TRIM(M.Nombre) AS Marca,
        M.Id_Marca,
        PR.Id_ListaPrecios,
        CT.Impto AS Impuesto
        FROM [OLEIDB1].[dbo].[PRODUCTOS] P
        JOIN [OLEIDB1].[dbo].[FAMILIAS] F ON P.Id_Familia = F.Id_Familia
        JOIN [OLEIDB1].[dbo].[PRECIOS] PR ON P.Codigo = PR.Codigo
        JOIN [OLEIDB1].[dbo].[EXISTENCIAS] E ON P.Codigo = E.Codigo AND PR.Id_Marca = E.Id_Marca
        JOIN [OLEIDB1].[dbo].[MARCAS] M ON PR.Id_Marca = M.Id_Marca
        JOIN [OLEIDB1].[dbo].[COSTOS] CT ON P.Codigo = CT.Codigo AND PR.Id_Marca = CT.Id_Marca
        WHERE P.Codigo = @Codigo AND M.Nombre = @Marca AND PR.Id_ListaPrecios = @ListaPrecios AND E.Id_Almacen = @Almacen
    `,

    getTotalProducts: "SELECT COUNT(*) FROM [OLEIDB1].[dbo].[CLIENTES]",

    // Users
    getAllUsers: "SELECT TOP(500) * FROM [OLEIDB1_CLIENTES].[dbo].[USUARIOS]",
    getUser: "SELECT * FROM [OLEIDB1_CLIENTES].[dbo].[USUARIOS] WHERE Nombre = ?",

    // Tables
    getFamilias: `SELECT TRIM(F.Nombre) AS Nombre FROM [OLEIDB1].[dbo].[FAMILIAS] F`,
    getMarcas: `SELECT TRIM(M.Nombre) AS Nombre FROM [OLEIDB1].[dbo].[MARCAS] M`,
    getFolios: `SELECT TRIM(P.Codigo) AS Codigo FROM [OLEIDB1].[dbo].[PRODUCTOS] P`,

    // Clients
    getClientBySearch: `
        SELECT TOP(20) TRIM(C.Nombre) AS Nombre, C.Id_Cliente, C.Id_Almacen, C.Id_ListPre
        FROM [OLEIDB1].[dbo].[CLIENTES] C
    `,

    // Order
    getPreviewDataToPostOrder: `
        SELECT 
        (
            SELECT TOP 1 Folio FROM [@database].[dbo].[VENTAS]
            WHERE Folio = (SELECT MAX(Folio) FROM [@database].[dbo].[VENTAS])
        ) AS Folio,
        (
            SELECT SerieActiva FROM [@database].[dbo].[DATOSFISCALES]
            WHERE Id_Almacen = @Id_Almacen
        ) AS SerieActiva,
        Id_Descuento, Id_CondVta, Id_Vendedor, Id_FormaPago, Id_Transporte
        FROM [@database].[dbo].[CLIENTES]
        WHERE Id_Cliente = @Id_Cliente AND Id_Almacen = @Id_Almacen
    `,

    getOrder :  ` 
        SELECT V.Folio, V.Piezas, V.Subtotal, V.Impuesto, V.Total, V.Fecha, C.Nombre as Cliente, VE.Nombre as Vendedor
        FROM [@database].[dbo].[VENTAS] AS V
        INNER JOIN [@database].[dbo].[CLIENTES] AS C ON V.Id_Cliente = C.Id_Cliente AND V.Id_Almacen = C.Id_Almacen
        INNER JOIN [@database].[dbo].[VENDEDORES] AS VE ON V.Id_Vendedor = VE.Id_Vendedor
        WHERE V.Id_Cliente = @Id_Cliente AND TipoDoc = 3 AND Folio = @folio
    `,

    getAllOrders: `
        SELECT V.Folio, V.Piezas, V.Subtotal, V.Impuesto, V.Total, V.Fecha ,C.Nombre as Cliente, VE.Nombre as Vendedor
        FROM [@database].[dbo].[VENTAS] AS V
        INNER JOIN [@database].[dbo].[CLIENTES] AS C ON V.Id_Cliente = C.Id_Cliente AND V.Id_Almacen = C.Id_Almacen
        INNER JOIN [@database].[dbo].[VENDEDORES] AS VE ON V.Id_Vendedor = VE.Id_Vendedor
        WHERE V.Id_Cliente = @Id_Cliente AND TipoDoc = @TipoDocOO
        ORDER BY Fecha DESC
    `,

    insertOrder: ` 
        INSERT INTO [OLEIDB1].[dbo].[VENTAS]  (
            Id_Cliente, Id_Almacen, Id_AlmacenClte, TipoDoc, Serie, Folio, Fecha,
            Subtotal, Impuesto, Total, Saldo, Id_Descuento, Id_CondVta, Id_Vendedor, Id_Formapago,
            Id_Transporte, FechaLiq, Estado, Piezas, Moneda, Paridad, CantDescuento,
            Suma, Id_Usuario, Id_ListPre, CantLetra, FechaEntrega
        ) 
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
            (SELECT TOP 1 Folio FROM [@database].[dbo].[VENTAS] WHERE Folio = (SELECT TOP 1 Folio FROM [@database].[dbo].[VENTAS] ORDER BY Folio DESC)) AS Folio,
            (SELECT Costo FROM [@database].[dbo].[COSTOS] WHERE TRIM(Codigo) = '@Codigo' AND Id_Marca = '@Id_Marca') AS Costo,
            (SELECT TRIM(SerieActiva) FROM [@database].[dbo].[DATOSFISCALES] WHERE Id_Almacen = @Id_Almacen) AS SerieActiva,
            (SELECT Id_Descuento FROM [@database].[dbo].[CLIENTES] WHERE Id_Cliente = @Id_Cliente AND Id_Almacen = @Id_Almacen) AS Id_Descuento,
            (SELECT Valor FROM [@database].[dbo].[DESCUENTOS] WHERE Id_Descuento = (SELECT Id_Descuento FROM [@database].[dbo].[CLIENTES] WHERE Id_Cliente = @Id_Cliente AND Id_Almacen = @Id_Almacen)) AS Valor,
            P.SwNs,
            TRIM(P.SKU) AS SKU,
            P.Id_Unidad AS Id_Unidad
        FROM [@database].[dbo].[PRODUCTOS] AS P
        WHERE TRIM(P.Codigo) = '@Codigo'
    `,

    getOrderDetails : `
        SELECT D.Precio, D.Cantidad as Piezas, D.Importe, D.Impuesto, D.Id_Marca, D.Id_Almacen, D.Id_ListaPrecios, D.Folio, TRIM(D.Descripcion) AS Descripcion, TRIM(D.Codigo) AS Codigo, E.Existencia, F.Nombre AS Marca
        FROM [@database].[dbo].[DETALLEVENTAS] AS D
        INNER JOIN [@database].[dbo].[EXISTENCIAS] AS E ON D.Codigo = E.Codigo AND D.Id_Marca = E.Id_Marca AND D.Id_Almacen = E.Id_Almacen
        INNER JOIN [OLEIDB1].[dbo].[MARCAS] AS F ON D.Id_Marca = F.Id_Marca
        WHERE Folio = @folio
        ORDER BY Folio DESC
    `,

    insertOrderDetails:  ` 
        INSERT INTO [OLEIDB1].[dbo].[DETALLEVENTAS]  (
            Id_Almacen, TipoDoc, Serie, Folio, Codigo, Id_Marca, Id_ListaPrecios, Cantidad,
            Precio, Importe, Impuesto, Descripcion, Descuento, Id_Unidad, SwNs, TasaImpuesto, SKU, Partida, Costo
        ) 
        VALUES (
            @Id_Almacen, @TipoDoc, @Serie, @Folio, @Codigo, @Id_Marca, @Id_ListaPrecios, @Cantidad,
            @Precio, @Importe, @Impuesto, @Descripcion, @Descuento, @Id_Unidad, @SwNs, @TasaImpuesto, @SKU, @Partida,  @Costo
        );
    `
};
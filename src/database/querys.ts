export const querys = {


    getAllProducts: `
    SELECT DISTINCT
    TRIM(P.Descripcion) AS Descripcion,
    P.Id_Familia,
    TRIM(P.Codigo) AS CodigoProducto,
    TRIM(F.Nombre) AS Familia,
    TRIM(PR.Codigo) AS CodigoPrecio,
    PR.Precio,
    TRIM(E.Codigo) AS CodigoExistencia,
    E.Existencia,
    E.Id_Almacen,
    TRIM(M.Nombre) AS Marca,
    M.Id_Marca,
    PR.Id_ListaPrecios
    FROM [OLEIDB1].[dbo].[PRODUCTOS] P
    JOIN [OLEIDB1].[dbo].[FAMILIAS] F ON P.Id_Familia = F.Id_Familia
    JOIN [OLEIDB1].[dbo].[PRECIOS] PR ON P.Codigo = PR.Codigo
    JOIN [OLEIDB1].[dbo].[EXISTENCIAS] E ON P.Codigo = E.Codigo AND PR.Id_Marca = E.Id_Marca
    JOIN [OLEIDB1].[dbo].[MARCAS] M ON PR.Id_Marca = M.Id_Marca
    WHERE PR.Id_ListaPrecios = 1 AND E.Id_Almacen = 1
    `,
    getProductsBySearch: "SELECT TOP(20) TRIM(P.Descripcion) AS Descripcion FROM [OLEIDB1].[dbo].[PRODUCTOS] P",

    getProducById: "SELECT  FROM CLIENTES Where Id = @Id",
    addNewProduct:
        "INSERT INTO [OLEIDB1].[dbo].[CLIENTES] (Id_Almacen , Id_Cliente , Nombre) VALUES (@Id_Almacen ,@Id_Cliente ,@Nombre);",
    deleteProduct: "DELETE FROM [OLEIDB1].[dbo].[CLIENTES] WHERE Id= @Id",
    getTotalProducts: "SELECT COUNT(*) FROM [OLEIDB1].[dbo].[CLIENTES]",
    updateProductById:
        "UPDATE [OLEIDB1].[dbo].[CLIENTES] SET Almacen = @Id_Almacen , Cliente = @Id_Cliente , Nombre = @Nombre WHERE Id = @id",


    getAllUsers: "SELECT TOP(500) * FROM [OLEIDB1_CLIENTES].[dbo].[USUARIOS]",
    getUser: "SELECT * FROM [OLEIDB1_CLIENTES].[dbo].[USUARIOS] WHERE Nombre = ?"
};
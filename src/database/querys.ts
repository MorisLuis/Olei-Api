export const querys = {
    getAllProducts: "SELECT TOP(500) * FROM [OLEIDB1].[dbo].[CLIENTES]",
    getProducById: "SELECT * FROM CLIENTES Where Id = @Id",
    addNewProduct:
        "INSERT INTO [OLEIDB1].[dbo].[CLIENTES] (Id_Almacen , Id_Cliente , Nombre) VALUES (@Id_Almacen ,@Id_Cliente ,@Nombre);",
    deleteProduct: "DELETE FROM [OLEIDB1].[dbo].[CLIENTES] WHERE Id= @Id",
    getTotalProducts: "SELECT COUNT(*) FROM [OLEIDB1].[dbo].[CLIENTES]",
    updateProductById:
        "UPDATE [OLEIDB1].[dbo].[CLIENTES] SET Almacen = @Id_Almacen , Cliente = @Id_Cliente , Nombre = @Nombre WHERE Id = @id",
};

export const clientsQuerys = {

    getClients: `
        SELECT 
            CONCAT(Id_Cliente, '-', Id_Almacen) AS Id_Unique,
            Id_Cliente, 
            Id_Almacen, 
            Nombre, 
            Telefono1, 
            CorreoVtas
        FROM [dbo].[CLIENTES]
        ORDER BY 
            CASE WHEN @OrderCondition = 'Id_Cliente' THEN Id_Cliente END,
            CASE WHEN @OrderCondition = 'Nombre' THEN Nombre END,
            Id_Cliente
        OFFSET (@PageNumber - 1) * @PageSize ROWS
        FETCH NEXT @PageSize ROWS ONLY;
    `,

    getClientId: ` 
        SELECT 
            IdOLEI,
            Id_Almacen,
            Id_Cliente,
            Nombre,
            RazonSocial,
            RFC,
            CURP,
            Calle,
            NoExt,
            NoInt,
            Colonia,
            Id_Ciudad,
            CodigoPost,
            Telefono1,
            CorreoVtas
            FROM dbo.CLIENTES
        WHERE Id_Cliente = @Id_Cliente AND Id_Almacen = @Id_Almacen
    `
}
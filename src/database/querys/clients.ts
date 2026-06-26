
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
        WHERE (@Nombre IS NULL OR Nombre LIKE '%' + @Nombre + '%')
        AND (@Id_Cliente IS NULL OR Id_Cliente = @Id_Cliente)
        AND (@Id_Almacen IS NULL OR Id_Almacen = @Id_Almacen)
        ORDER BY 

        CASE 
            WHEN @Nombre <> '' AND LOWER(Nombre) LIKE LOWER(@Nombre) + '%' THEN 0
            WHEN @Nombre <> '' THEN 1
            ELSE 0
        END,
            CASE WHEN @OrderCondition = 'Id_Cliente' THEN Id_Cliente END,
            CASE WHEN @OrderCondition = 'Nombre' THEN Nombre END,
            Id_Cliente
        OFFSET (@PageNumber - 1) * @PageSize ROWS
        FETCH NEXT @PageSize ROWS ONLY;
    `,

    getTotalClients: `
        SELECT COUNT(*) AS TotalCount
        FROM [dbo].[CLIENTES]
        WHERE (@Nombre IS NULL OR Nombre LIKE '%' + @Nombre + '%')
        AND (@Id_Cliente IS NULL OR Id_Cliente = @Id_Cliente)
        AND (@Id_Almacen IS NULL OR Id_Almacen = @Id_Almacen);
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
            Telefono2,
            UsuarioSQL AS TelefonoWhatsapp,
            CorreoVtas
            FROM dbo.CLIENTES
        WHERE Id_Cliente = @Id_Cliente AND Id_Almacen = @Id_Almacen
    `,

    getClientBySearch: `
        SELECT TOP(10) 
            TRIM(C.Nombre) AS Nombre, 
            C.Id_Cliente,
            C.Id_Almacen, 
            C.Id_ListPre, 
            C.CorreoVtas, 
            C.Telefono1
        FROM [dbo].[CLIENTES] C
        WHERE LOWER(C.Nombre) LIKE '%' + LOWER(@nombre) + '%'
        ORDER BY 
        CASE 
            WHEN LOWER(Nombre) LIKE LOWER(@nombre) + '%' THEN 0 -- Prioridad para coincidencia inicial
            ELSE 1
        END,
        Nombre; -- Luego orden alfabético
    `,
}
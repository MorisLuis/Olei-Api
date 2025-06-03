"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.clientsQuerys = void 0;
exports.clientsQuerys = {
    getClients: `
        SELECT 
            CONCAT(Id_Cliente, '-', Id_Almacen) AS Id_Unique,
            Id_Cliente, 
            Id_Almacen, 
            Nombre, 
            Telefono1, 
            CorreoVtas
        FROM [dbo].[CLIENTES]
        WHERE Nombre LIKE '%' + @searchTerm + '%'
        AND (@searchId IS NULL OR Id_Cliente = @searchId)
        ORDER BY 
        -- 👇 Solo prioriza los que empiecen con @searchTerm si @searchTerm no es vacío
        CASE 
            WHEN @searchTerm <> '' AND LOWER(Nombre) LIKE LOWER(@searchTerm) + '%' THEN 0
            WHEN @searchTerm <> '' THEN 1
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
        WHERE Nombre LIKE '%' + @searchTerm + '%'
        AND (@searchId IS NULL OR Id_Cliente = @searchId)
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
};
//# sourceMappingURL=clients.js.map
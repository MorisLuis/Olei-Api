export const generalQuerys = {

    getFamilias: `
        SELECT TOP(10)
        TRIM(Nombre) AS Nombre  
        FROM [dbo].[FAMILIAS]
        WHERE LOWER(Nombre) LIKE '%' + LOWER(@Nombre) + '%'
        ORDER BY 
        CASE 
            WHEN LOWER(Nombre) LIKE LOWER(@Nombre) + '%' THEN 0 -- Prioridad para coincidencia inicial
            ELSE 1
        END,
        Nombre; -- Luego orden alfabético
    `,

    getMarcas: `
        SELECT TOP(10)
        TRIM(Nombre) AS Nombre  
        FROM [dbo].[MARCAS]
        WHERE LOWER(Nombre) LIKE '%' + LOWER(@Nombre) + '%'
        ORDER BY 
        CASE 
            WHEN LOWER(Nombre) LIKE LOWER(@Nombre) + '%' THEN 0 -- Prioridad para coincidencia inicial
            ELSE 1
        END,
        Nombre; -- Luego orden alfabético
    `,

    getFolios: `
        SELECT TOP(10)
        TRIM(Codigo) AS Codigo
        FROM [dbo].[PRODUCTOS]
        WHERE LOWER(Codigo) LIKE '%' + LOWER(@Codigo) + '%'
        ORDER BY 
        CASE 
            WHEN LOWER(Codigo) LIKE LOWER(@Codigo) + '%' THEN 0 -- Prioridad para coincidencia inicial
            ELSE 1
        END,
        Codigo; -- Luego orden alfabético
    `,
}
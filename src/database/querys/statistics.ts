

export const statisticsQuery = {

    getProductsStatistics: `
        WITH
        ProductosConEstatus
        AS
            (
                SELECT
                    [Id_Almacen],
                    [Codigo],
                    [Id_Marca],
                    [Existencia],
                    CASE
                    WHEN [Existencia] < 1 THEN 'No tienes productos'
                    WHEN [Existencia] = 1 THEN 'Estás casi sin productos'
                    WHEN [Existencia] BETWEEN 2 AND 5 THEN 'Tienes menos de 5 productos'
                    WHEN [Existencia] BETWEEN 6 AND 15 THEN 'Aun tienes productos, pero no muchos'
                    ELSE 'Tienes buena cantidad de productos'
                END AS Estatus,
                    CASE
                    WHEN [Existencia] < 1 THEN 'WithoutStock'
                    WHEN [Existencia] = 1 THEN 'AlmostWithoutStock'
                    WHEN [Existencia] BETWEEN 2 AND 5 THEN 'WithLessThan5'
                    WHEN [Existencia] BETWEEN 6 AND 15 THEN 'Between5And16'
                    ELSE 'MoreThan16'
                END AS Path
                FROM [dbo].[EXISTENCIAS]
            )

        SELECT
            Estatus,
            Path,
            COUNT(*) AS CantidadProductos
        FROM ProductosConEstatus
        GROUP BY Estatus, Path;
    `,

    getProductsWithoutStock: `
        SELECT
            E.Id_Almacen,
            E.Codigo,
            E.Id_Marca,
            E.Existencia,
            M.Nombre AS Marca,
            P.Descripcion
        FROM [dbo].[EXISTENCIAS] E
        JOIN [dbo].[MARCAS] M ON M.Id_Marca = E.Id_Marca
        JOIN [dbo].[PRODUCTOS] P ON P.Codigo = E.Codigo
        WHERE Existencia < 1
        ORDER BY Existencia ASC
        OFFSET (@PageNumber - 1) * @PageSize ROWS
        FETCH NEXT @PageSize ROWS ONLY
    `,

    getProductsAlmostWithoutStock: `
        SELECT
            E.Id_Almacen,
            E.Codigo,
            E.Id_Marca,
            E.Existencia,
            M.Nombre AS Marca,
            P.Descripcion
        FROM [dbo].[EXISTENCIAS] E
        JOIN [dbo].[MARCAS] M ON M.Id_Marca = E.Id_Marca
        JOIN [dbo].[PRODUCTOS] P ON P.Codigo = E.Codigo
        WHERE Existencia = 1
        ORDER BY Existencia ASC
        OFFSET (@PageNumber - 1) * @PageSize ROWS
        FETCH NEXT @PageSize ROWS ONLY
    `,

    getProductsWithLessThan5: `
        SELECT
            E.Id_Almacen,
            E.Codigo,
            E.Id_Marca,
            E.Existencia,
            M.Nombre AS Marca,
            P.Descripcion
        FROM [dbo].[EXISTENCIAS] E
        JOIN [dbo].[MARCAS] M ON M.Id_Marca = E.Id_Marca
        JOIN [dbo].[PRODUCTOS] P ON P.Codigo = E.Codigo
        WHERE Existencia BETWEEN 2 AND 5
        ORDER BY Existencia ASC
        OFFSET (@PageNumber - 1) * @PageSize ROWS
        FETCH NEXT @PageSize ROWS ONLY
    `,

    getProductsBetween5And16: `
        SELECT
            E.Id_Almacen,
            E.Codigo,
            E.Id_Marca,
            E.Existencia,
            M.Nombre AS Marca,
            P.Descripcion
        FROM [dbo].[EXISTENCIAS] E
        JOIN [dbo].[MARCAS] M ON M.Id_Marca = E.Id_Marca
        JOIN [dbo].[PRODUCTOS] P ON P.Codigo = E.Codigo
        WHERE Existencia BETWEEN 6 AND 15
        ORDER BY Existencia ASC
        OFFSET (@PageNumber - 1) * @PageSize ROWS
        FETCH NEXT @PageSize ROWS ONLY
    `,

    getProductsWithMoreThan16: `
        SELECT
            E.Id_Almacen,
            E.Codigo,
            E.Id_Marca,
            E.Existencia,
            M.Nombre AS Marca,
            P.Descripcion
        FROM [dbo].[EXISTENCIAS] E
        JOIN [dbo].[MARCAS] M ON M.Id_Marca = E.Id_Marca
        JOIN [dbo].[PRODUCTOS] P ON P.Codigo = E.Codigo
        WHERE Existencia > 15
        ORDER BY Existencia ASC
        OFFSET (@PageNumber - 1) * @PageSize ROWS
        FETCH NEXT @PageSize ROWS ONLY
    `

}
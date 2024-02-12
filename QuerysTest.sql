/* GET PRODUCTS WITH LOW EXISTENCE */

/* SELECT TOP (1000) [Id_Almacen]
      ,[Codigo]
      ,[Id_Marca]
      ,[Existencia]
  FROM [dbo].[EXISTENCIAS]
  WHERE Existencia BETWEEN 1 AND 5
  ORDER BY Existencia ASC */



/* GET PRODUCTS WITH LOW EXISTENCE, DANGER EXISTENCE, WARNING EXISTENCE, GOOD EXISTENCE */

/* WITH ProductosConEstatus AS (
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
        END AS Estatus
    FROM [dbo].[EXISTENCIAS]
)

SELECT
    Estatus,
    COUNT(*) AS CantidadProductos
FROM ProductosConEstatus
GROUP BY Estatus;
 */



/* RETURN PRODUCTS COUNT BY FAMILY WITH EXISTENCE */
/* SELECT E.Codigo, E.Existencia, P.Id_Familia, F.Nombre AS Familia, E.Id_Marca
FROM [dbo].[EXISTENCIAS] E
    INNER JOIN [dbo].[PRODUCTOS] P ON E.Codigo = P.Codigo
    INNER JOIN [dbo].[FAMILIAS] F ON F.Id_Familia = P.Id_Familia
WHERE Existencia > 0
ORDER BY Familia */

/* WITH ProductosPorMarca AS (
    SELECT E.Codigo, E.Existencia, P.Id_Familia, F.Nombre AS Marca
    FROM [dbo].[EXISTENCIAS] E
    INNER JOIN [dbo].[PRODUCTOS] P ON E.Codigo = P.Codigo
    INNER JOIN [dbo].[FAMILIAS] F ON F.Id_Familia = P.Id_Familia
)

SELECT  Marca, 
COUNT(*) AS CantidadProductos
FROM ProductosPorMarca
GROUP BY Marca
HAVING COUNT(*) > 50 */

/* RETURN PRODUCTS COUNT BY FAMILY WITH EXISTENCE */
/* WITH ProductosPorMarca AS (
    SELECT E.Codigo, E.Existencia, P.Id_Familia, F.Nombre AS Familia
    FROM [dbo].[EXISTENCIAS] E
    INNER JOIN [dbo].[PRODUCTOS] P ON E.Codigo = P.Codigo
    INNER JOIN [dbo].[FAMILIAS] F ON F.Id_Familia = P.Id_Familia
    WHERE Existencia > 0
)

SELECT  Familia, 
COUNT(*) AS CantidadProductos
FROM ProductosPorMarca
GROUP BY Familia */

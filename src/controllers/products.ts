import { Request, Response } from 'express'
import { dbConnection, querys } from '../database';


const getProducts = async (req: Request, res: Response) => {
    try {
        const pool = await dbConnection();

        if (!pool) {
            res.status(500).json({ error: 'No se pudo establecer la conexión con la base de datos' });
            return;
        }

        const getAllProducts = `
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

    `;
    

        const result = await pool.request().query(getAllProducts);

        res.json({
            products: result.recordset,
        });
    } catch (error: any) {
        res.status(500).json({ error: error.message });
    }
};



const getProducById = async (req: Request, res: Response) => {

    try {
        const pool = await dbConnection()
        const result = await pool
            ?.request()
            .input("id", req.params.id)
            .query(querys.getProducById)

        return res.json(result?.recordset[0]);
    } catch (error: any) {
        res.status(500)
        res.send(error.message);
    }

}


const deleteProductById = async (req: Request, res: Response) => {

    try {
        const pool = await dbConnection()
        const result = await pool
            ?.request()
            .input("id", req.params.id)
            .query(querys.deleteProduct)

        if (result?.rowsAffected[0] === 0) return res.sendStatus(404);

        return res.sendStatus(204);

    } catch (error: any) {
        res.status(500)
        res.send(error.message);
    }

}

const getTotalProducts = async (req: Request, res: Response) => {
    const pool = await dbConnection();

    const result = await pool?.request().query(querys.getTotalProducts);

    res.json(result?.recordset[0][""]);
};


export {
    getProducts,
    getProducById,
    deleteProductById,
    getTotalProducts,
}
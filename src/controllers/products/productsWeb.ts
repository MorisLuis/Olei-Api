import { Request, Response } from 'express'
import { closeDbConnection, dbConnection } from '../../database';
import { productsQuerys } from '../../database/querys/products';
import sql from 'mssql';
import { handleGetWebSession } from '../../utils/Redis/getSession';
import { productsWebQuerys } from '../../database/querys/productsWeb';

const getProducts = async (req: Request, res: Response) => {

    const sessionId = req.sessionID;
    const { user: userFR } = await handleGetWebSession({ sessionId });

    if (!userFR) {
        return res.status(400).json({ error: 'Sesion terminada' });
    }

    const { Serverweb, Baseweb, Id_ListPre, SwSinStock, SwsinPrecio, SwImagenes, Id_Almacen } = userFR;

    try {
        const pool = await dbConnection(Serverweb, Baseweb);
        
        if (!pool) {
            res.status(500).json({ error: 'No se pudo establecer la conexión con la base de datos' });
            return;
        }

        const { nombre, marca, familia, folio, page = '1', limit = '10' } = req.query;

        const pageNumber = parseInt(page as string, 10) || 1;
        const limitNumber = parseInt(limit as string, 10) || 10;

        let query = productsWebQuerys.getAllProducts;

        const result = await pool.request()
            .input('nombre', sql.VarChar, nombre || '')
            .input('marca', sql.VarChar, marca || '')
            .input('familia', sql.VarChar, familia || '')
            .input('codigo', sql.VarChar, folio || '')
            .input('SwSinStock', sql.Bit, SwSinStock === true ? 1 : 0)
            .input('SwsinPrecio', sql.Bit, SwsinPrecio === true ? 1 : 0)
            .input('SwImagenes', sql.Bit, SwImagenes === true ? 1 : 0)
            .input('Id_ListPre', sql.Int, Id_ListPre)
            .input('Id_Almacen', sql.Int, Id_Almacen)
            .input('page', sql.Int, pageNumber)
            .input('limit', sql.Int, limitNumber)
            .input('baseSQL', sql.VarChar, Baseweb || '')
            .query(query);

        const products = result.recordset;

        res.json({
            total: products.length,
            products
        });

    } catch (error: any) {
        console.log({ errorGP: error })
        res.status(500).json({ error: error.message });
    }
};


const getProducByIdWeb = async (req: Request, res: Response) => {

    // Get session from REDIS.
    const sessionId = req.sessionID;
    const { user: userFR } = await handleGetWebSession({ sessionId });

    if (!userFR) {
        return res.status(400).json({ error: 'Sesion terminada' });
    }

    const { Serverweb, Baseweb, Id_ListPre, Id_Almacen } = userFR;

    try {

        const { id } = req.params;
        const { Marca } = req.query;

        const pool = await dbConnection(Serverweb, Baseweb);

        if (!pool) {
            return res.status(500).json({ error: 'No se pudo establecer la conexión con la base de datos' });
        }

        const result = await pool.request()
            .input("Codigo", id)
            .input("Marca", Marca)
            .input("ListaPrecios", Id_ListPre)
            .input("Almacen", Id_Almacen)
            .input('baseSQL', sql.VarChar, Baseweb || '')
            .query(productsQuerys.getProducById);

        const product = result?.recordset[0];

        return res.json(product);
    } catch (error) {
        console.log({ error })
        return res.status(500).json({ error });
    }
}

const getTotalProducts = async (req: Request, res: Response) => {

    // Get session from REDIS.
    const sessionId = req.sessionID;
    const { user: userFR } = await handleGetWebSession({ sessionId });

    if (!userFR) {
        return res.status(400).json({ error: 'Sesion terminada' });
    }

    const { Serverweb, Baseweb, Id_ListPre, SwSinStock, SwsinPrecio, SwImagenes, Id_Almacen } = userFR;

    try {

        const pool = await dbConnection(Serverweb, Baseweb);

        if (!pool) {
            res.status(500).json({ error: 'No se pudo establecer la conexión con la base de datos' });
            return;
        }

        const { nombre, marca, familia, folio } = req.query;

        const result = await pool?.request()
        .input('nombre', sql.VarChar, nombre || '')
        .input('marca', sql.VarChar, marca || '')
        .input('familia', sql.VarChar, familia || '')
        .input('codigo', sql.VarChar, folio || '')
        .input('SwSinStock', sql.Bit, SwSinStock === true ? 1 : 0)
        .input('SwsinPrecio', sql.Bit, SwsinPrecio === true ? 1 : 0)
        .input('SwImagenes', sql.Bit, SwImagenes === true ? 1 : 0)
        .input('Id_ListPre', sql.Int, Id_ListPre)
        .input('Id_Almacen', sql.Int, Id_Almacen)
        .query(productsWebQuerys.getTotalProducts);


        res.json({total: result?.recordset[0][""]});

    } catch (error) {
        console.log({ errorTP: error })
        return res.status(500).json({ error });
    }
};


// Utils
/* const checkImageExists = async (url: string): Promise<boolean> => {
    try {
        const response = await fetch(url, { method: 'HEAD' });
        return response.ok;
    } catch (error) {
        console.error('Error during image check:', error);
        return false;
    }
};

async function executeQuery(pool: sql.ConnectionPool, query: string, params: any) {
    try {
        // Execute the query with provided parameters
        const result = await pool.request()
            .input('ListaPrecios', sql.Int, params.ListaPrecios)
            .input('Almacen', sql.Int, params.Almacen)
            .query(query);

        return result.recordset;
    } catch (error) {
        throw error;
    }
} */

export {
    getProducts,
    getProducByIdWeb,
    getTotalProducts
}
import { Request, Response } from 'express'
import { dbConnection } from '../../database';
import sql from 'mssql';
import { handleGetWebSession } from '../../utils/Redis/getSession';
import { productsWebQuerys } from '../../database/querys/productsWeb';
import { getProductWithImages, getProductsWithImage } from '../../utils/checkImageExists';

const getProducts = async (req: Request, res: Response) => {

    const sessionId = req.sessionID;
    const { user: userFR } = await handleGetWebSession({ sessionId });

    console.log("getProducts======")

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
        const productsWithImages = await getProductsWithImage(products);

        res.json({
            total: productsWithImages.length,
            products: productsWithImages
        });

    } catch (error: any) {
        console.log({ errorGP: error });
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
            .query(productsWebQuerys.getProducById);

        const productBefore = result?.recordset[0];
        const product = await getProductWithImages({
            baseSQL: Baseweb, 
            Codigo: productBefore.Codigo,  
            product: productBefore
        });

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


        res.json({ total: result?.recordset[0][""] });

    } catch (error) {
        console.log({ errorTP: error })
        return res.status(500).json({ error });
    }
};


export {
    getProducts,
    getProducByIdWeb,
    getTotalProducts
}
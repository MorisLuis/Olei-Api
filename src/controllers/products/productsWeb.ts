import { NextFunction, Request, Response } from 'express'
import { dbConnection } from '../../database';
import sql from 'mssql';
import { handleGetWebSession } from '../../utils/Redis/getSession';
import { productsWebQuerys } from '../../database/querys/productsWeb';
import { getProductWithImages, getProductsWithImage } from '../../utils/checkImageExists';
import BadRequestError from '../../errors/BadRequestError';

const getProducts = async (req: Request, res: Response, next: NextFunction) => {


    try {
        const sessionId = req.sessionRedis;
        const { user: userFR } = await handleGetWebSession({ sessionId });

        if (!userFR) {
            throw new BadRequestError({ code: 401, message: "Sesion terminada", logging: true });
        }

        const { Serverweb, Baseweb, Id_ListPre, SwSinStock, SwsinPrecio, SwImagenes, Id_Almacen } = userFR;
        const pool = await dbConnection(Serverweb, Baseweb);

        if (!pool) {
            throw new BadRequestError({ code: 500, message: "No se pudo establecer la conexión con la base de datos", logging: true });
        }

        const { nombre, marca, familia, folio, page = '1', limit = '10' } = req.query;

        const pageNumber = parseInt(page as string, 10) || 1;
        const limitNumber = parseInt(limit as string, 10) || 10;

        let query = productsWebQuerys.getAllProducts;

        const result = await pool.request()
            .input('nombre', sql.VarChar, nombre ?? '')
            .input('marca', sql.VarChar, marca ?? '')
            .input('familia', sql.VarChar, familia ?? '')
            .input('codigo', sql.VarChar, folio ?? '')
            .input('SwSinStock', sql.Bit, SwSinStock === true ? 1 : 0)
            .input('SwsinPrecio', sql.Bit, SwsinPrecio === true ? 1 : 0)
            .input('SwImagenes', sql.Bit, SwImagenes === true ? 1 : 0)
            .input('Id_ListPre', sql.Int, Id_ListPre)
            .input('Id_Almacen', sql.Int, Id_Almacen)
            .input('page', sql.Int, pageNumber)
            .input('limit', sql.Int, limitNumber)
            .input('baseSQL', sql.VarChar, Baseweb ?? '')
            .query(query);

        const products = result.recordset;
        //const productsWithImages = await getProductsWithImage(products);

        res.json({
            total: products.length,
            products: products
        });

    } catch (error) {
        next(error)
    }
};

const getProducByIdWeb = async (req: Request, res: Response, next: NextFunction) => {


    try {
        // Get session from REDIS.
        const sessionId = req.sessionRedis
        const { user: userFR } = await handleGetWebSession({ sessionId });

        if (!userFR) {
            throw new BadRequestError({ code: 401, message: "Sesion terminada", logging: true });
        }

        const { Serverweb, Baseweb, Id_ListPre, Id_Almacen } = userFR;

        const { id } = req.params;
        const { Marca } = req.query;

        const pool = await dbConnection(Serverweb, Baseweb);

        if (!pool) {
            throw new BadRequestError({ code: 500, message: "No se pudo establecer la conexión con la base de datos", logging: true });
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
        next(error)
    }
}

const getTotalProducts = async (req: Request, res: Response, next: NextFunction) => {

    try {
        // Get session from REDIS.
        const sessionId = req.sessionRedis
        const { user: userFR } = await handleGetWebSession({ sessionId });

        if (!userFR) {
            throw new BadRequestError({ code: 401, message: "Sesion terminada", logging: true });
        }

        const { Serverweb, Baseweb, Id_ListPre, SwSinStock, SwsinPrecio, SwImagenes, Id_Almacen } = userFR;

        const pool = await dbConnection(Serverweb, Baseweb);

        if (!pool) {
            throw new BadRequestError({ code: 500, message: "No se pudo establecer la conexión con la base de datos", logging: true });
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
        next(error)
    }
};


export {
    getProducts,
    getProducByIdWeb,
    getTotalProducts
}
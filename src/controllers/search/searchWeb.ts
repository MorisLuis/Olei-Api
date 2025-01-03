import { NextFunction, Request, Response } from 'express'
import { dbConnection, querys } from '../../database';
import sql from 'mssql';
import { productsQuerys } from '../../database/querys/products';
import { handleGetWebSession } from '../../utils/Redis/getSession';
import BadRequestError from '../../errors/BadRequestError';


/* change to  */
const searchProduct = async (req: Request, res: Response, next: NextFunction) => {

    try {
        // Get session from REDIS.
        const sessionId = req.sessionRedis
        const { user: userFR } = await handleGetWebSession({ sessionId });
        
        console.log({userFR})

        if (!userFR) {
            throw new BadRequestError({ code: 401, message: "Sesion terminada", logging: true });
        };

        const { Serverweb, Baseweb, Id_ListPre, SwSinStock, SwsinPrecio, Id_Almacen } = userFR;
        const { nombre, familia, codigo, marca } = req.query;
        const pool = await dbConnection(Serverweb, Baseweb);

        if (!pool) {
            throw new BadRequestError({ code: 500, message: "Unable to establish a connection to the database", logging: true })
        }

        // Execute the SQL query
        const result = await pool.request()
            .input('Descripcion', sql.VarChar, nombre)
            .input('Id_ListaPrecios', sql.Int, Id_ListPre)
            .input('Id_Almacen', sql.Int, Id_Almacen)
            .input('Codigo', sql.VarChar, codigo || "")
            .input('familia', sql.VarChar, familia || "")
            .input('marca', sql.VarChar, marca || "")
            .input('SwSinStock', sql.Bit, SwSinStock === true ? 1 : 0)
            .input('SwsinPrecio', sql.Bit, SwsinPrecio === true ? 1 : 0)
            .query(productsQuerys.getProductsBySearch);

        const products = result.recordset.map(row => row.Descripcion);

        res.json({
            total: products.length,
            products
        });
    } catch (error) {
        next(error)
    }
};


/* CHANGED TO client.ts */
const searchClient = async (req: Request, res: Response, next: NextFunction) => {

    /* try {

        // Get session from REDIS.
        const sessionId = req.sessionRedis
        const { user: userFR } = await handleGetWebSession({ sessionId });

        if (!userFR) {
            throw new BadRequestError({ code: 401, message: "Sesion terminada", logging: true })
        }

        const { Serverweb, Baseweb } = userFR;
        const pool = await dbConnection(Serverweb, Baseweb);

        if (!pool) {
            throw new BadRequestError({ code: 500, message: "Unable to establish a connection to the database", logging: true })
        };

        const { term } = req.query
        let query = querys.getClientBySearch;
        const result = await pool.request()
            .input('nombre', sql.VarChar, term)
            .query(query);

        const Clients = result.recordset

        res.json({
            Clients
        })

    } catch (error) {
        next(error)
    } */
};

export {
    searchProduct,
    searchClient
}
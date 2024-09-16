import { Request, Response } from 'express'
import { closeDbConnection, dbConnection, querys } from '../../database';
import sql from 'mssql';
import { productsQuerys } from '../../database/querys/products';
import { handleGetWebSession } from '../../utils/Redis/getSession';

const searchProduct = async (req: Request, res: Response) => {

    // Get session from REDIS.
    const sessionId = req.sessionID;
    const { user: userFR } = await handleGetWebSession({ sessionId });

    if (!userFR) {
        return res.status(400).json({ error: 'Sesion terminada' });
    }

    const { Serverweb, Baseweb, Id_ListPre, SwSinStock, SwsinPrecio, Id_Almacen } = userFR;

    try {
        const { nombre, familia, codigo, marca } = req.query;
        const pool = await dbConnection(Serverweb, Baseweb);

        if (!pool) {
            return res.status(500).json({ error: 'Unable to establish a connection to the database' });
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
    } catch (error: any) {
        console.log({ error })
        res.status(500).json({ error: error.message });
    }
};

const searchClient = async (req: Request, res: Response) => {

    // Get session from REDIS.
    const sessionId = req.sessionID;
    console.log({sessionINSEARCHCLIENT: sessionId})
    const { user: userFR } = await handleGetWebSession({ sessionId });

    if (!userFR) {
        return res.status(400).json({ error: 'Sesion terminada' });
    }

    const { Serverweb, Baseweb } = userFR;

    try {
        const pool = await dbConnection(Serverweb, Baseweb);

        if (!pool) {
            return res.status(500).json({ error: 'Unable to establish a connection to the database' });
        };

        const { term } = req.query
        let query = querys.getClientBySearch;
        const result = await pool.request()
            .input('nombre', sql.VarChar, term)
            .query(query);

        const Clients = result.recordset

        //const Clients = result.recordset.map(row => row.Descripcion);

        res.json({
            Clients
        })

    } catch (error: any) {
        res.status(500).json({ error: error.message });
    } finally {
        await closeDbConnection()
    }
};


export {
    searchProduct,
    searchClient
}
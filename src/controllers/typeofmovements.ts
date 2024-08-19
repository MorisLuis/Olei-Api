import { Request, Response } from 'express'
import { dbConnection } from '../database';
import sql from "mssql";


const getTypeofmovements = async (req: Request, res: Response) => {

    const serverclientes = req.server;
    const baseclientes = req.base;
    const userId = req.id;

    try {
        const pool = await dbConnection(serverclientes, baseclientes);

        const request = pool.request();
        request.input('Id_Usuario', sql.VarChar(50), userId);
        const resultData = await request.execute('fn_GetTypeOfMovement');
        const TiposMovimiento = resultData?.recordset

        res.json(TiposMovimiento);

    } catch (error: any) {
        res.status(500);
        res.send(error.message);
    }
}

export {
    getTypeofmovements
}
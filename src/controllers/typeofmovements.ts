import { Request, Response } from 'express'
import { dbConnection } from '../database';
import sql from "mssql";
import { handleGetSession } from '../utils/Redis/getSession';


const getTypeofmovements = async (req: Request, res: Response) => {

    const sessionId = req.sessionID;
    const { user: userFR } = await handleGetSession({ sessionId });

    if (!userFR) {
        return res.status(400).json({ error: 'Sesion terminada' });
    }

    const { serverclientes, baseclientes, PasswordSQL, UsuarioSQL, userId } = userFR;


    try {
        const pool = await dbConnection(serverclientes, baseclientes, PasswordSQL, UsuarioSQL);

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
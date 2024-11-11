import { NextFunction, Request, Response } from 'express'
import { dbConnection } from '../database';
import sql from "mssql";
import { handleGetSession } from '../utils/Redis/getSession';
import BadRequestError from '../errors/BadRequestError';


const getTypeofmovements = async (req: Request, res: Response, next: NextFunction) => {
    
    try {
        const sessionId = req.sessionID;
        const { user: userFR } = await handleGetSession({ sessionId });
    
        if (!userFR) {
            throw new BadRequestError({ code: 401, message: "Sesion terminada", logging: true });
        }
    
        const { serverclientes, baseclientes, PasswordSQL, UsuarioSQL, userId } = userFR;
        const pool = await dbConnection(serverclientes, baseclientes, UsuarioSQL, PasswordSQL);

        const request = pool.request();
        request.input('Id_Usuario', sql.VarChar(50), userId);
        const resultData = await request.execute('fn_GetTypeOfMovement');
        const TiposMovimiento = resultData?.recordset
        res.json(TiposMovimiento);

    } catch (error) {
        next(error)
    }
}

export {
    getTypeofmovements
}
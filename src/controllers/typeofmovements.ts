import { NextFunction, Request, Response } from 'express'
import { dbConnection } from '../database';
import sql from "mssql";
import { handleGetSession } from '../utils/Redis/getSession';
import { UnauthorizedError } from '../errors/CustomError';


const getTypeofmovements = async (req: Request, res: Response, next: NextFunction) => {
    
    try {
        const sessionId = req.sessionID;
        const { user: userFR } = await handleGetSession({ sessionId });
    
        if (!userFR) {
            throw new UnauthorizedError('Sesion terminada')
        };

        const { ServidorSQL, BaseSQL, PasswordSQL, UsuarioSQL, userId } = userFR;
        const pool = await dbConnection(ServidorSQL, BaseSQL, UsuarioSQL, PasswordSQL);

        const request = pool.request();
        request.input('Id_Usuario', sql.VarChar(50), userId);
        const resultData = await request.execute('fn_GetTypeOfMovement');
        const TiposMovimiento = resultData?.recordset;
        res.json(TiposMovimiento);

    } catch (error) {
        next(error)
    }
}

export {
    getTypeofmovements
}
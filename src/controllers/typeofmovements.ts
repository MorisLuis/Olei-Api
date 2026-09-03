import type { NextFunction, Request, Response } from 'express'
import { dbConnection } from '../database';
import sql from "mssql";

/**
 * @description Lists inventory movement types available to the authenticated App user.
 * @client App
 * @router GET /api/typeofmovements
 * @session Requires the App tenant session and user identifier.
 * @response JSON containing `TiposMovimiento`; database failures are forwarded to `next`.
 */
const getTypeofmovements = async (req: Request, res: Response, next: NextFunction): Promise<Response | void>   => {
    
    try {
        const session = req.session;
        const { ServidorSQL, BaseSQL, PasswordSQL, UsuarioSQL, Id_UsuarioOLEI } = session;
        const pool = await dbConnection(ServidorSQL, BaseSQL, UsuarioSQL, PasswordSQL);

        const request = pool.request();
        request.input('Id_Usuario', sql.VarChar(50), Id_UsuarioOLEI);
        const resultData = await request.execute('fn_GetTypeOfMovement');
        const TiposMovimiento = resultData?.recordset;

        return res.json({
            TiposMovimiento
        });

    } catch (error) {
        return next(error)
    }
}

export {
    getTypeofmovements
}

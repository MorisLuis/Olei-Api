import { NextFunction, Request, Response } from 'express'
import { dbConnection, querys } from '../database';
import { handleGetWebSession } from '../utils/Redis/getSession';
import BadRequestError from '../errors/BadRequestError';


const getUsers = async (req: Request, res: Response, next: NextFunction) => {

    // Get session from REDIS.
    const sessionId = req.sessionRedis
    const { user: userFR } = await handleGetWebSession({ sessionId });

    if (!userFR) {
        throw new BadRequestError({ code: 401, message: "Sesion terminada", logging: true });
    }

    const { Serverweb, Baseweb } = userFR;

    try {
        const pool = await dbConnection(Serverweb, Baseweb);
        const result = await pool?.request().query(querys.getAllUsers);
        const users = result?.recordset
        const total = result?.rowsAffected[0]
        res.json({
            total,
            users
        });

    } catch (error) {
        next(error)
    }

}

export {
    getUsers
}
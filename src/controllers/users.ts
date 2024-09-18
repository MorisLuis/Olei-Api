import { Request, Response } from 'express'
import { dbConnection, querys } from '../database';
import { handleGetWebSession } from '../utils/Redis/getSession';


const getUsers = async (req: Request, res: Response) => {

    // Get session from REDIS.
    const sessionId = req.sessionRedis
    const { user: userFR } = await handleGetWebSession({ sessionId });

    if (!userFR) {
        return res.status(400).json({ error: 'Sesion terminada' });
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

    } catch (error: any) {
        console.log({ getUsersError: error })
        res.status(500);
        res.send(error.message);
    }

}

export {
    getUsers
}
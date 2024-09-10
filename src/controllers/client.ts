import { Request, Response } from 'express';
import { generateWebJWT } from '../helpers/generate-jwt';
import { closeDbConnection } from '../database';
import { handleGetWebSession } from '../utils/Redis/getSession';

const selectClient = async (req: Request, res: Response) => {


    // Get session from REDIS.
    const sessionId = req.sessionID;
    const { user: userFR } = await handleGetWebSession({ sessionId });

    if (!userFR) {
        return res.status(400).json({ error: 'Sesion terminada' });
    }

    const { Id } = userFR;

    try {
        const { Id_Cliente, Id_Almacen, Id_ListPre } = req.body;

        const client = {
            Id_Almacen: Id_Almacen,
            Id_Cliente: Id_Cliente,
            Id_ListPre: Id_ListPre,
            IsEmploye: true
        }

        const token = await generateWebJWT({ Id: Id });

        return res.json({
            client,
            token
        })

    } catch (error: any) {
        console.log({ error })
        return res.status(500).send(error.message);
    } finally {
        await closeDbConnection()
    }

}

export {
    selectClient
}
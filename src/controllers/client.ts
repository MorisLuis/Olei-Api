import { NextFunction, Request, Response } from 'express';
import { generateWebJWT } from '../helpers/generate-jwt';
import { handleGetWebSession } from '../utils/Redis/getSession';
import { UserWebSessionInterface } from '../interface/user';
import { handleDeleteRedisSession } from '../utils/Redis/deleteRedis';
import BadRequestError from '../errors/BadRequestError';

const selectClient = async (req: Request, res: Response, next: NextFunction) => {

    // Get session from REDIS.
    const sessionId = req.sessionRedis;
    const { user: userFR } = await handleGetWebSession({ sessionId });

    if (!userFR) {
        throw new BadRequestError({ code: 401, message: "Sesion terminada", logging: true });
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

        const datosDelUsuario: UserWebSessionInterface = {
            ...userFR,
            ...client
        };

        (req.session as any).userWeb = datosDelUsuario;

        const token = await generateWebJWT({ Id: Id, sessionRedis: req.sessionID });
        handleDeleteRedisSession({ sessionId })

        return res.json({
            ok: true,
            token
        })

    } catch (error) {
        next(error)
    }
}

export {
    selectClient
}
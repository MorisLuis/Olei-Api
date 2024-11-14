import { NextFunction, Request, Response } from 'express';
import { generateWebJWT } from '../helpers/generate-jwt';
import { handleGetWebSession } from '../utils/Redis/getSession';
import { UserWebSessionInterface } from '../interface/user';
import { handleDeleteRedisSession } from '../utils/Redis/deleteRedis';
import BadRequestError from '../errors/BadRequestError';
import { getClientIdService, getClientsService } from '../services/clientsServices';
import { ClientOrderCondition, ClientOrderConditionType } from '../interface/client';

const getClients = async (req: Request, res: Response, next: NextFunction) => {

    try {
        const { PageNumber, clientOrderCondition } = req.query;
        const sessionId = req.sessionID;

        let orderCondition: ClientOrderConditionType | string;
        if (typeof clientOrderCondition === 'string' && ClientOrderCondition.includes(clientOrderCondition as ClientOrderConditionType)) {
            orderCondition = clientOrderCondition;
        } else {
            orderCondition = ""
        }

        const meeting = await getClientsService({
            PageNumber: Number(PageNumber),
            sessionId,
            OrderCondition: orderCondition
        });

        res.json(meeting);
    } catch (error) {
        next(error)
    };
};

const getClientId = async (req: Request, res: Response, next: NextFunction) => {

    try {
        const { PageNumber, clientOrderCondition, Id_Almacen, Id_Cliente } = req.query;
        const sessionId = req.sessionID;

        let orderCondition: ClientOrderConditionType | string;
        if (typeof clientOrderCondition === 'string' && ClientOrderCondition.includes(clientOrderCondition as ClientOrderConditionType)) {
            orderCondition = clientOrderCondition;
        } else {
            orderCondition = ""
        }

        const meeting = await getClientIdService({
            sessionId,
            Id_Cliente: Number(Id_Cliente),
            Id_Almacen: Number(Id_Almacen)
        });

        res.json(meeting);
    } catch (error) {
        next(error)
    };
}

const selectClient = async (req: Request, res: Response, next: NextFunction) => {


    try {
        // Get session from REDIS.
        const sessionId = req.sessionRedis;
        const { user: userFR } = await handleGetWebSession({ sessionId });

        if (!userFR) {
            throw new BadRequestError({ code: 401, message: "Sesion terminada", logging: true });
        }
        const { Id } = userFR;
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
    getClients,
    getClientId,
    selectClient
}
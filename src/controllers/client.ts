import { NextFunction, Request, Response } from 'express';
import { generateWebJWT } from '../helpers/generate-jwt';
import { handleGetWebSession } from '../utils/Redis/getSession';
import { UserWebSessionInterface } from '../interface/user';
import { handleDeleteRedisSession } from '../utils/Redis/deleteRedis';
import BadRequestError from '../errors/BadRequestError';
import { getClientIdService, getClientsService, getTotalClientsService } from '../services/clientsServices';
import { getClientIdQuerySchema, getClientsQuerySchema, selectClientBodySchema } from '../validations/clientValidations';
import { z } from 'zod';

const getClients = async (req: Request, res: Response, next: NextFunction) => {

    try {
        const { PageNumber, clientOrderCondition } = getClientsQuerySchema.parse(req.query);
        const sessionId = req.sessionRedis;

        const clients = await getClientsService({
            sessionId,
            PageNumber: PageNumber,
            OrderCondition: clientOrderCondition
        });

        res.json(clients);
    } catch (error) {
        next(error)
    };

};

const getTotalClients = async (req: Request, res: Response, next: NextFunction) => {

    try {
        const sessionId = req.sessionRedis;
        const total = await getTotalClientsService(sessionId);
        res.json(total);
    } catch (error) {
        next(error)
    };

};

const getClientId = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const { Id_Almacen, Id_Cliente } = getClientIdQuerySchema.parse(req.query);
        const sessionId = req.sessionRedis;

        const clients = await getClientIdService({
            sessionId,
            Id_Cliente,
            Id_Almacen
        });

        res.status(200).json({
            success: true,
            data: clients ?? null
        });
    } catch (error) {
        if (error instanceof z.ZodError) {
            res.status(400).json({ message: "Validation error", errors: error.errors });
        } else {
            next(error);
        }
    }
};

const selectClient = async (req: Request, res: Response, next: NextFunction) => {

    try {
        // Get session from REDIS.
        const sessionId = req.sessionRedis;
        const { user: userFR } = await handleGetWebSession({ sessionId });

        if (!userFR) {
            throw new BadRequestError({ code: 401, message: "Sesion terminada", logging: true });
        };

        const { Id } = userFR;
        const { Id_Cliente, Id_Almacen, Id_ListPre } = selectClientBodySchema.parse(req.body);

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
    selectClient,
    getTotalClients
}
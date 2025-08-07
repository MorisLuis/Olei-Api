import type { NextFunction, Request, Response } from 'express';
import type { UserWebSessionInterface } from '../interface/user';
import { getClientIdService, getClientsService, getTotalClientsService, searchClientService } from '../services/clients/clientsServices';
import { getClientIdQuerySchema, getClientsQuerySchema, getClientsTotalQuerySchema, searchClientQuerySchema, selectClientBodySchema } from '../validations/clientValidations';
import { updateWebSession } from '../helpers/generate-redis';

const getClients = async (req: Request, res: Response, next: NextFunction): Promise<Response | void> => {

    try {
        const { PageNumber, clientOrderCondition, searchTerm, searchId, limit } = getClientsQuerySchema.parse(req.query);
        const skip = (PageNumber - 1) * limit;
        const userSession = req.sessionWeb;

        const { clients, total } = await getClientsService({
            skip,
            limit,
            userSession,
            clientOrderCondition,
            searchTerm,
            searchId
        });

        return res.json({
            ok: true,
            clients,
            total
        });
    } catch (error) {
        return next(error);
    };

};

const getTotalClients = async (req: Request, res: Response, next: NextFunction): Promise<Response | void> => {

    try {
        const { searchTerm } = getClientsTotalQuerySchema.parse(req.query)
        const userSession = req.sessionWeb;
        const total = await getTotalClientsService({ userSession, searchTerm });
        return res.json({ total });
    } catch (error) {
        return next(error);
    };

};

const getClientId = async (req: Request, res: Response, next: NextFunction): Promise<Response | void> => {
    try {
        const { Id_Almacen, Id_Cliente } = getClientIdQuerySchema.parse(req.query);
        const userSession = req.sessionWeb;

        const client = await getClientIdService({
            userSession,
            Id_Cliente,
            Id_Almacen
        });

        return res.json({
            client
        });
    } catch (error) {
        return next(error);
    }
};

const selectClient = async (req: Request, res: Response, next: NextFunction): Promise<Response | void> => {

    try {
        const userSession = req.sessionWeb;
        const sessionId = req.sessionId;
        const { Id_Cliente, Id_Almacen, Id_ListPre } = selectClientBodySchema.parse(req.body);

        const client: Partial<UserWebSessionInterface> = {
            Id_Almacen: Id_Almacen,
            Id_Cliente: Id_Cliente,
            Id_ListPre: Id_ListPre,
            IsEmploye: true
        }

        const datosDelUsuario: UserWebSessionInterface = {
            ...userSession,
            ...client
        };

        await updateWebSession(sessionId, datosDelUsuario)

        return res.json({
            ok: true
        })

    } catch (error) {
        return next(error);
    }
};

const searchClient = async (req: Request, res: Response, next: NextFunction): Promise<Response | void> => {

    try {
        const userSession = req.sessionWeb
        const { term } = searchClientQuerySchema.parse(req.query)
        const { clients } = await searchClientService({ userSession, term })

        return res.json({
            clients
        })

    } catch (error) {
        return next(error)
    }
};

export {
    getClients,
    getClientId,
    selectClient,
    searchClient,
    getTotalClients
}
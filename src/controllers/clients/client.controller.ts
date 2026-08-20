import type { NextFunction, Request, Response } from 'express';
import { getClientIdService } from '../../services/clients/getClientById.service';
import { getClientsService } from '../../services/clients/getClients.service';
import { getTotalClientsService } from '../../services/clients/getTotalClients.service';
import { searchClientService } from '../../services/clients/searchClient.service';
import { selectClientService } from '../../services/clients/selectClient.service';
import { updateClientService } from '../../services/clients/updateClient.service';
import { getClientIdQuerySchema, getClientsQuerySchema, getClientsTotalQuerySchema, searchClientQuerySchema, selectClientBodySchema } from './client.schema';

const getClients = async (req: Request, res: Response, next: NextFunction): Promise<Response | void> => {

    try {
        const {
            PageNumber,
            limit,
            orderField,
            orderDirection,
            Id_Cliente,
            Nombre,
            Id_Almacen
        } = getClientsQuerySchema.parse(req.query);
    
        const userSession = req.sessionWeb;

        const { clientes, total } = await getClientsService({
            userSession,
            orderField,
            orderDirection,
            PageNumber,
            limit,
            Nombre,
            Id_Cliente,
            Id_Almacen
        })

        return res.json({
            ok: true,
            clients: clientes,
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

        await selectClientService({ sessionId, userSession, Id_Cliente, Id_Almacen, Id_ListPre });

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

const updateClient = async (req: Request, res: Response, next: NextFunction): Promise<Response | void> => {

    try {
        const userSession = req.sessionWeb
        const body = req.body;
        const { id: Id_Cliente } = req.params
        const { Id_Almacen } = req.query;

        const { client } = await updateClientService({
            userSession,
            Id_Cliente: Number(Id_Cliente),
            Id_Almacen: Number(Id_Almacen),
            body
        })

        return res.json({
            client
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
    getTotalClients,
    updateClient
}

import { NextFunction, Request, Response } from "express"
import { dbConnection } from "../database";
import sql from 'mssql';
import { orderQuerys } from "../database/querys/orders";
import { handleGetWebSession } from "../utils/Redis/getSession";
import BadRequestError from '../errors/BadRequestError';
import { getOrderDetailsQuerrySchema, getTotalOrderDetailsQuerrySchema, postOrderBodySchema } from '../validations/orderValidations';
import { getOrderDetailsSells, getTotalOrderDetailsSells, postOrderService } from "../services/orderServices";

const postOrder = async (req: Request, res: Response, next: NextFunction) => {

    try {
        // Get session from REDIS.
        const sessionId = req.sessionRedis
        const { sellsDetails, sellsData } = postOrderBodySchema.parse(req.body);
        const { Subtotal, Total } = sellsData ?? {}

        const { folio } = await postOrderService({
            sellsData,
            sellsDetails,
            sessionId,
            Subtotal,
            Total
        });

        res.status(201).json({
            ok: true,
            folio
        });

    } catch (error) {
        next(error)
    }
};

const getOrder = async (req: Request, res: Response, next: NextFunction) => {


    try {
        // Get session from REDIS.
        const sessionId = req.sessionRedis
        const { user: userFR } = await handleGetWebSession({ sessionId });

        if (!userFR) {
            throw new BadRequestError({ code: 401, message: "Sesion terminada", logging: true });
        }

        const { Serverweb, Baseweb, TipoDocOO, Id_Cliente } = userFR;
        const { folio } = req.params;
        const pool = await dbConnection(Serverweb, Baseweb);

        if (!pool) {
            throw new BadRequestError({ code: 500, message: "No se pudo establecer la conexión con la base de datos", logging: true });
        }

        const getOrderQuery = orderQuerys.getOrder;

        const request = await pool.request()
            .input('Id_Cliente', sql.Int, Id_Cliente)
            .input('folio', sql.Int, folio)
            .input('TipoDocOO', TipoDocOO)
            .query(getOrderQuery);

        let order = request.recordset[0];

        res.json(order)

    } catch (error) {
        next(error)
    }
}

const getAllOrders = async (req: Request, res: Response, next: NextFunction) => {


    try {
        // Get session from REDIS.
        const sessionId = req.sessionRedis
        const { user: userFR } = await handleGetWebSession({ sessionId });

        if (!userFR) {
            throw new BadRequestError({ code: 401, message: "Sesion terminada", logging: true });
        }

        const { Serverweb, Baseweb, TipoDocOO, Id_Cliente } = userFR;
        const { page, limit } = req.query;

        const pool = await dbConnection(Serverweb, Baseweb);

        if (!pool) {
            throw new BadRequestError({ code: 500, message: "No se pudo establecer la conexión con la base de datos", logging: true });
        }

        const query = orderQuerys.getAllOrders;

        const request = await pool.request()
            .input('TipoDocOO', TipoDocOO)
            .input('Id_Cliente', sql.Int, Id_Cliente)
            .input('PageNumber', sql.Int, page)
            .input('PageSize', sql.Int, limit)
            .query(query);

        let allOrders = request.recordset;

        res.json(allOrders);

    } catch (error) {
        next(error)
    }
}

const getOrderDetails = async (req: Request, res: Response, next: NextFunction) => {


    try {
        const { folio, PageNumber } = getOrderDetailsQuerrySchema.parse(req.query);

        // Get session from REDIS.
        const sessionId = req.sessionRedis

        const orderDetails = await getOrderDetailsSells({
            folio,
            PageNumber,
            sessionId
        })

        res.json(orderDetails)

    } catch (error) {
        next(error)
    }
}

const getTotalOrderDetails = async (req: Request, res: Response, next: NextFunction) => {


    try {
        const { folio } = getTotalOrderDetailsQuerrySchema.parse(req.query);

        // Get session from REDIS.
        const sessionId = req.sessionRedis

        const orderDetails = await getTotalOrderDetailsSells({
            folio,
            sessionId
        })

        res.json(orderDetails)

    } catch (error) {
        next(error)
    }
}

const getTotalOrders = async (req: Request, res: Response, next: NextFunction) => {

    try {
        // Get session from REDIS.
        const sessionId = req.sessionRedis
        const { user: userFR } = await handleGetWebSession({ sessionId });

        if (!userFR) {
            throw new BadRequestError({ code: 401, message: "Sesion terminada", logging: true });
        }

        const { Serverweb, Baseweb, TipoDocOO, Id_Cliente } = userFR;

        const pool = await dbConnection(Serverweb, Baseweb);

        if (!pool) {
            throw new BadRequestError({ code: 500, message: "No se pudo establecer la conexión con la base de datos", logging: true });
        }

        const result = await pool?.request()
            .input('TipoDocOO', TipoDocOO)
            .input('Id_Cliente', sql.Int, Id_Cliente)
            .query(orderQuerys.getTotalOrders);

        res.json({ total: result?.recordset[0][""] });

    } catch (error) {
        next(error)
    }
};


export {
    postOrder,
    getOrder,
    getAllOrders,
    getOrderDetails,
    getTotalOrders,
    getTotalOrderDetails
}
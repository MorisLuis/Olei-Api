import type { NextFunction, Request, Response } from "express"
import { getAllOrdersParamsSchema, getOrderDetailsQuerrySchema, getOrderParamsSchema, getTotalOrderDetailsQuerrySchema, postOrderBodySchema } from '../validations/orderValidations';
import { getAllOrdersService, getOrderDetailsSells, getOrderService, getTotalOrderDetailsService, getTotalAllOrdersService, postOrderService } from "../services/order/orderServices";


const getOrder = async (req: Request, res: Response, next: NextFunction): Promise<Response | void> => {

    try {
        const userSession = req.sessionWeb
        const { folio } = getOrderParamsSchema.parse(req.params);

        const { order } = await getOrderService({
            userSession,
            folio
        })
        return res.json(order)

    } catch (error) {
        return next(error);

    }
};

const getAllOrders = async (req: Request, res: Response, next: NextFunction): Promise<Response | void> => {

    try {
        const userSession = req.sessionWeb
        const { page, limit } = getAllOrdersParamsSchema.parse(req.query);

        const { allOrders } = await getAllOrdersService({
            userSession,
            page,
            limit
        });

        return res.json(allOrders);
    } catch (error) {
        return next(error);

    }
};

const getOrderDetails = async (req: Request, res: Response, next: NextFunction): Promise<Response | void> => {

    try {
        const userSession = req.sessionWeb
        const { folio, TipoDoc, PageNumber } = getOrderDetailsQuerrySchema.parse(req.query);

        const { orderDetails } = await getOrderDetailsSells({
            folio,
            TipoDoc,
            PageNumber,
            userSession
        })


        return res.json({
            orderDetails
        })

    } catch (error) {
        return next(error);

    }
};

const getTotalAllOrders = async (req: Request, res: Response, next: NextFunction): Promise<Response | void> => {

    try {
        const userSession = req.sessionWeb;
        const { total } = await getTotalAllOrdersService(userSession);
        return res.json({ total });
    } catch (error) {
        return next(error);
    }
};

const getTotalOrderDetails = async (req: Request, res: Response, next: NextFunction): Promise<Response | void> => {

    try {
        const userSession = req.sessionWeb
        const { folio, TipoDoc } = getTotalOrderDetailsQuerrySchema.parse(req.query);

        const { total } = await getTotalOrderDetailsService({
            folio,
            TipoDoc,
            userSession
        })

        return res.json({
            total
        })

    } catch (error) {
        return next(error);
    }
};

const postOrder = async (req: Request, res: Response, next: NextFunction): Promise<Response | void> => {

    try {
        // Get session from REDIS.
        const userSession = req.sessionWeb
        const { sellsDetails, sellsData } = postOrderBodySchema.parse(req.body);
        const { Subtotal, Total } = sellsData ?? {}

        const { folio } = await postOrderService({
            sellsData,
            sellsDetails,
            userSession,
            Subtotal,
            Total
        });

        return res.status(201).json({
            ok: true,
            folio
        });

    } catch (error) {
        return next(error);
    }
};

export {
    postOrder,
    getOrder,
    getAllOrders,
    getOrderDetails,
    getTotalAllOrders,
    getTotalOrderDetails
}
import { NextFunction, Request, Response } from "express"
import { getAllOrdersParamsSchema, getOrderDetailsQuerrySchema, getOrderParamsSchema, getTotalOrderDetailsQuerrySchema, postOrderBodySchema } from '../validations/orderValidations';
import { getAllOrdersService, getOrderDetailsSells, getOrderService, getTotalOrderDetailsService, getTotalAllOrdersService, postOrderService } from "../services/orderServices";
import { z } from "zod";

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
        if (error instanceof z.ZodError) {
            res.status(400).json({ message: "Validation error", errors: error.errors });
        } else {
            next(error);
        }
    }
};

const getOrder = async (req: Request, res: Response, next: NextFunction) => {

    try {
        const sessionId = req.sessionRedis
        const { folio } = getOrderParamsSchema.parse(req.params);

        const { order } = await getOrderService({
            sessionId,
            folio
        })


        res.json(order)

    } catch (error) {
        if (error instanceof z.ZodError) {
            res.status(400).json({ message: "Validation error", errors: error.errors });
        } else {
            next(error);
        }
    }
};

const getAllOrders = async (req: Request, res: Response, next: NextFunction) => {

    try {
        const sessionId = req.sessionRedis
        const { page, limit } = getAllOrdersParamsSchema.parse(req.query);

        const { allOrders } = await getAllOrdersService({
            sessionId,
            page,
            limit
        });

        res.json(allOrders);
    } catch (error) {
        if (error instanceof z.ZodError) {
            res.status(400).json({ message: "Validation error", errors: error.errors });
        } else {
            next(error);
        }
    }
};

const getOrderDetails = async (req: Request, res: Response, next: NextFunction) => {

    try {
        const sessionId = req.sessionRedis
        const { folio, PageNumber } = getOrderDetailsQuerrySchema.parse(req.query);

        const orderDetails = await getOrderDetailsSells({
            folio,
            PageNumber,
            sessionId
        })

        res.json(orderDetails)

    } catch (error) {
        if (error instanceof z.ZodError) {
            res.status(400).json({ message: "Validation error", errors: error.errors });
        } else {
            next(error);
        }
    }
};

const getTotalAllOrders = async (req: Request, res: Response, next: NextFunction) => {

    try {
        const sessionId = req.sessionRedis;
        const { total } = await getTotalAllOrdersService(sessionId);
        res.json({ total });
    } catch (error) {
        if (error instanceof z.ZodError) {
            res.status(400).json({ message: "Validation error", errors: error.errors });
        } else {
            next(error);
        }
    }
};

const getTotalOrderDetails = async (req: Request, res: Response, next: NextFunction) => {


    try {
        const sessionId = req.sessionRedis
        const { folio } = getTotalOrderDetailsQuerrySchema.parse(req.query);

        const orderDetails = await getTotalOrderDetailsService({
            folio,
            sessionId
        })

        res.json(orderDetails)

    } catch (error) {
        if (error instanceof z.ZodError) {
            res.status(400).json({ message: "Validation error", errors: error.errors });
        } else {
            next(error);
        }
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
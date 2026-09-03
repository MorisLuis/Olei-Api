import type { NextFunction, Request, Response } from "express"
import { getAllOrdersParamsSchema, getOrderDetailsQuerrySchema, getOrderParamsSchema, getTotalOrderDetailsQuerrySchema, postOrderBodySchema } from '../validations/orderValidations';
import { getAllOrdersService, getOrderDetailsSells, getOrderService, getTotalOrderDetailsService, getTotalAllOrdersService, postOrderService } from "../services/order/orderServices";


/** 
 * @description Returns one CRM order by folio.
 * @client CRM
 * @router GET /api/order/:folio
 * @request Validated folio and order query context; requires the CRM web tenant session.
 * @response JSON containing `order`; failures are forwarded to `next`.
 */
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

/** 
 * @description Returns filtered and paginated CRM orders.
 * @client CRM
 * @router GET /api/order/all
 * @request Validated filters, ordering, and pagination; requires the CRM web tenant session.
 * @response JSON containing orders; failures are forwarded to `next`.
 */
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

/** 
 * @description Returns filtered and paginated CRM order detail rows.
 * @client CRM
 * @router GET /api/order/details
 * @request Validated detail filters and pagination; requires the CRM web tenant session.
 * @response JSON containing order details; failures are forwarded to `next`.
 */
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

/** 
 * @description Returns the total CRM orders matching the query filters.
 * @client CRM
 * @router GET /api/order/all/count
 * @request Validated order filters; requires the CRM web tenant session.
 * @response JSON containing the total; failures are forwarded to `next`.
 */
const getTotalAllOrders = async (req: Request, res: Response, next: NextFunction): Promise<Response | void> => {

    try {
        const userSession = req.sessionWeb;
        const { total } = await getTotalAllOrdersService(userSession);
        return res.json({ total });
    } catch (error) {
        return next(error);
    }
};

/**
 * @description Returns the total CRM order detail rows matching the query filters.
 * @client CRM
 * @router GET /api/order/details/total
 * @request Validated detail filters; requires the CRM web tenant session.
 * @response JSON containing the total; failures are forwarded to `next`.
 */
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

/** 
 * @description Creates a CRM order from validated header and detail data.
 * @client CRM
 * @router POST /api/order
 * @request Validated order body; requires the CRM web tenant session.
 * @response HTTP 201 JSON containing the created folio; validation and transaction failures are forwarded to `next`.
 */
const postOrder = async (req: Request, res: Response, next: NextFunction): Promise<Response | void> => {

    try {
        const userSession = req.sessionWeb
        const { sellsDetails, sellsData } = postOrderBodySchema.parse(req.body);
        const { Subtotal, Total } = sellsData ?? {}

        const { folio, TipoDoc } = await postOrderService({
            sellsData,
            sellsDetails,
            userSession,
            Subtotal,
            Total
        });

        return res.status(201).json({
            ok: true,
            folio,
            TipoDoc
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

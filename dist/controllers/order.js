"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getTotalOrderDetails = exports.getTotalAllOrders = exports.getOrderDetails = exports.getAllOrders = exports.getOrder = exports.postOrder = void 0;
const orderValidations_1 = require("../validations/orderValidations");
const orderServices_1 = require("../services/order/orderServices");
const getOrder = async (req, res, next) => {
    try {
        const userSession = req.sessionWeb;
        const { folio } = orderValidations_1.getOrderParamsSchema.parse(req.params);
        const { order } = await (0, orderServices_1.getOrderService)({
            userSession,
            folio
        });
        return res.json(order);
    }
    catch (error) {
        return next(error);
    }
};
exports.getOrder = getOrder;
const getAllOrders = async (req, res, next) => {
    try {
        const userSession = req.sessionWeb;
        const { page, limit } = orderValidations_1.getAllOrdersParamsSchema.parse(req.query);
        const { allOrders } = await (0, orderServices_1.getAllOrdersService)({
            userSession,
            page,
            limit
        });
        return res.json(allOrders);
    }
    catch (error) {
        return next(error);
    }
};
exports.getAllOrders = getAllOrders;
const getOrderDetails = async (req, res, next) => {
    try {
        const userSession = req.sessionWeb;
        const { folio, TipoDoc, PageNumber } = orderValidations_1.getOrderDetailsQuerrySchema.parse(req.query);
        const { orderDetails } = await (0, orderServices_1.getOrderDetailsSells)({
            folio,
            TipoDoc,
            PageNumber,
            userSession
        });
        return res.json({
            orderDetails
        });
    }
    catch (error) {
        return next(error);
    }
};
exports.getOrderDetails = getOrderDetails;
const getTotalAllOrders = async (req, res, next) => {
    try {
        const userSession = req.sessionWeb;
        const { total } = await (0, orderServices_1.getTotalAllOrdersService)(userSession);
        return res.json({ total });
    }
    catch (error) {
        return next(error);
    }
};
exports.getTotalAllOrders = getTotalAllOrders;
const getTotalOrderDetails = async (req, res, next) => {
    try {
        const userSession = req.sessionWeb;
        const { folio, TipoDoc } = orderValidations_1.getTotalOrderDetailsQuerrySchema.parse(req.query);
        const { total } = await (0, orderServices_1.getTotalOrderDetailsService)({
            folio,
            TipoDoc,
            userSession
        });
        return res.json({
            total
        });
    }
    catch (error) {
        return next(error);
    }
};
exports.getTotalOrderDetails = getTotalOrderDetails;
const postOrder = async (req, res, next) => {
    try {
        // Get session from REDIS.
        const userSession = req.sessionWeb;
        const { sellsDetails, sellsData } = orderValidations_1.postOrderBodySchema.parse(req.body);
        const { Subtotal, Total } = sellsData ?? {};
        const { folio, TipoDoc } = await (0, orderServices_1.postOrderService)({
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
    }
    catch (error) {
        return next(error);
    }
};
exports.postOrder = postOrder;
//# sourceMappingURL=order.js.map
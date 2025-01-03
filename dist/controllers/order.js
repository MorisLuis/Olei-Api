"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getTotalOrderDetails = exports.getTotalAllOrders = exports.getOrderDetails = exports.getAllOrders = exports.getOrder = exports.postOrder = void 0;
const orderValidations_1 = require("../validations/orderValidations");
const orderServices_1 = require("../services/orderServices");
const zod_1 = require("zod");
const postOrder = async (req, res, next) => {
    try {
        // Get session from REDIS.
        const sessionId = req.sessionRedis;
        const { sellsDetails, sellsData } = orderValidations_1.postOrderBodySchema.parse(req.body);
        const { Subtotal, Total } = sellsData ?? {};
        const { folio } = await (0, orderServices_1.postOrderService)({
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
    }
    catch (error) {
        if (error instanceof zod_1.z.ZodError) {
            res.status(400).json({ message: "Validation error", errors: error.errors });
        }
        else {
            next(error);
        }
    }
};
exports.postOrder = postOrder;
const getOrder = async (req, res, next) => {
    try {
        const sessionId = req.sessionRedis;
        const { folio } = orderValidations_1.getOrderParamsSchema.parse(req.params);
        const { order } = await (0, orderServices_1.getOrderService)({
            sessionId,
            folio
        });
        res.json(order);
    }
    catch (error) {
        if (error instanceof zod_1.z.ZodError) {
            res.status(400).json({ message: "Validation error", errors: error.errors });
        }
        else {
            next(error);
        }
    }
};
exports.getOrder = getOrder;
const getAllOrders = async (req, res, next) => {
    try {
        const sessionId = req.sessionRedis;
        const { page, limit } = orderValidations_1.getAllOrdersParamsSchema.parse(req.query);
        const { allOrders } = await (0, orderServices_1.getAllOrdersService)({
            sessionId,
            page,
            limit
        });
        res.json(allOrders);
    }
    catch (error) {
        if (error instanceof zod_1.z.ZodError) {
            res.status(400).json({ message: "Validation error", errors: error.errors });
        }
        else {
            next(error);
        }
    }
};
exports.getAllOrders = getAllOrders;
const getOrderDetails = async (req, res, next) => {
    try {
        const sessionId = req.sessionRedis;
        const { folio, PageNumber } = orderValidations_1.getOrderDetailsQuerrySchema.parse(req.query);
        const orderDetails = await (0, orderServices_1.getOrderDetailsSells)({
            folio,
            PageNumber,
            sessionId
        });
        res.json(orderDetails);
    }
    catch (error) {
        if (error instanceof zod_1.z.ZodError) {
            res.status(400).json({ message: "Validation error", errors: error.errors });
        }
        else {
            next(error);
        }
    }
};
exports.getOrderDetails = getOrderDetails;
const getTotalAllOrders = async (req, res, next) => {
    try {
        const sessionId = req.sessionRedis;
        const { total } = await (0, orderServices_1.getTotalAllOrdersService)(sessionId);
        res.json({ total });
    }
    catch (error) {
        if (error instanceof zod_1.z.ZodError) {
            res.status(400).json({ message: "Validation error", errors: error.errors });
        }
        else {
            next(error);
        }
    }
};
exports.getTotalAllOrders = getTotalAllOrders;
const getTotalOrderDetails = async (req, res, next) => {
    try {
        const sessionId = req.sessionRedis;
        const { folio } = orderValidations_1.getTotalOrderDetailsQuerrySchema.parse(req.query);
        const orderDetails = await (0, orderServices_1.getTotalOrderDetailsService)({
            folio,
            sessionId
        });
        res.json(orderDetails);
    }
    catch (error) {
        if (error instanceof zod_1.z.ZodError) {
            res.status(400).json({ message: "Validation error", errors: error.errors });
        }
        else {
            next(error);
        }
    }
};
exports.getTotalOrderDetails = getTotalOrderDetails;
//# sourceMappingURL=order.js.map
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.searchProduct = exports.getTotalProducts = exports.getProducByIdWeb = exports.getProducts = void 0;
const productsServices_1 = require("../../services/productsServices");
const productsValidations_1 = require("../../validations/productsValidations");
const getProducts = async (req, res, next) => {
    try {
        const sessionId = req.sessionRedis;
        const { nombre, marca, familia, folio, page, limit } = productsValidations_1.getProductsQuerySchema.parse(req.query);
        const { products } = await (0, productsServices_1.getProductsService)({
            sessionId,
            nombre,
            marca,
            familia,
            folio,
            page,
            limit
        });
        return res.json({
            products
        });
    }
    catch (error) {
        return next(error);
    }
};
exports.getProducts = getProducts;
const getProducByIdWeb = async (req, res, next) => {
    try {
        // Get session from REDIS.
        const sessionId = req.sessionRedis;
        const { id: codigo } = req.params;
        const { Marca } = productsValidations_1.getProducByIdWebQuerySchema.parse(req.query);
        const { product } = await (0, productsServices_1.getProducByIdWebService)({
            sessionId,
            codigo,
            Marca
        });
        return res.json(product);
    }
    catch (error) {
        return next(error);
    }
};
exports.getProducByIdWeb = getProducByIdWeb;
const getTotalProducts = async (req, res, next) => {
    try {
        // Get session from REDIS.
        const sessionId = req.sessionRedis;
        const { nombre, marca, familia, folio } = productsValidations_1.getTotalProductsQuerySchema.parse(req.query);
        const { total } = await (0, productsServices_1.getTotalProductsService)({
            sessionId,
            nombre,
            marca,
            familia,
            folio
        });
        return res.json({ total });
    }
    catch (error) {
        return next(error);
    }
};
exports.getTotalProducts = getTotalProducts;
const searchProduct = async (req, res, next) => {
    try {
        // Get session from REDIS.
        const sessionId = req.sessionRedis;
        const { nombre, familia, codigo, marca } = productsValidations_1.serachProductQuerySchema.parse(req.query);
        const { products } = await (0, productsServices_1.searchProductService)({
            sessionId,
            nombre,
            familia,
            codigo,
            marca
        });
        return res.json({
            products
        });
    }
    catch (error) {
        return next(error);
    }
};
exports.searchProduct = searchProduct;
//# sourceMappingURL=productsWeb.js.map
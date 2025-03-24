"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.searchProduct = exports.getTotalProducts = exports.getProducByIdWeb = exports.getProducts = void 0;
const productsServices_1 = require("../../services/productsServices");
const productsValidations_1 = require("../../validations/productsValidations");
const getProducts = async (req, res, next) => {
    try {
        const userSession = req.sessionWeb;
        const { nombre, marca, familia, folio, page, limit } = productsValidations_1.getProductsQuerySchema.parse(req.query);
        const { products } = await (0, productsServices_1.getProductsService)({
            userSession,
            nombre,
            marca,
            familia,
            folio,
            page,
            limit
        });
        const response = { products };
        return res.json(response);
    }
    catch (error) {
        return next(error);
    }
};
exports.getProducts = getProducts;
const getProducByIdWeb = async (req, res, next) => {
    try {
        const userSession = req.sessionWeb;
        const { id: codigo } = req.params;
        const { Marca } = productsValidations_1.getProducByIdWebQuerySchema.parse(req.query);
        const { product } = await (0, productsServices_1.getProducByIdWebService)({
            userSession,
            codigo,
            Marca
        });
        const response = { product };
        return res.json(response);
    }
    catch (error) {
        return next(error);
    }
};
exports.getProducByIdWeb = getProducByIdWeb;
const getTotalProducts = async (req, res, next) => {
    try {
        const userSession = req.sessionWeb;
        const { nombre, marca, familia, folio } = productsValidations_1.getTotalProductsQuerySchema.parse(req.query);
        const { total } = await (0, productsServices_1.getTotalProductsService)({
            userSession,
            nombre,
            marca,
            familia,
            folio
        });
        const response = { total };
        return res.json(response);
    }
    catch (error) {
        return next(error);
    }
};
exports.getTotalProducts = getTotalProducts;
const searchProduct = async (req, res, next) => {
    try {
        const userSession = req.sessionWeb;
        const { nombre, familia, codigo, marca } = productsValidations_1.serachProductQuerySchema.parse(req.query);
        const { products } = await (0, productsServices_1.searchProductService)({
            userSession,
            nombre,
            familia,
            codigo,
            marca
        });
        const response = { products };
        return res.json(response);
    }
    catch (error) {
        return next(error);
    }
};
exports.searchProduct = searchProduct;
//# sourceMappingURL=productsWeb.js.map
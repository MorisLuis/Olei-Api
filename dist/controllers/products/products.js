"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.getProductByStockAndCodeBar = exports.getTotalOfProductsByStock = exports.getProductsByStock = exports.getProducById = void 0;
const database_1 = require("../../database");
const products_1 = require("../../database/querys/products");
const identifyBarcodeType_1 = require("../../utils/identifyBarcodeType");
const getSession_1 = require("../../utils/Redis/getSession");
const productsWeb_1 = require("../../database/querys/productsWeb");
const BadRequestError_1 = __importDefault(require("../../errors/BadRequestError"));
const productsValidations_1 = require("../../validations/productsValidations");
const productsServices_1 = require("../../services/productsServices");
const getProducById = async (req, res, next) => {
    try {
        const { id } = req.params;
        const { Marca } = req.query;
        const Id_Usuario = req.id;
        const sessionId = req.sessionID;
        const { user: userFR } = await (0, getSession_1.handleGetSession)({ sessionId });
        if (!userFR) {
            throw new BadRequestError_1.default({ code: 401, message: "Sesion terminada", logging: true });
        }
        const { serverclientes, baseclientes, PasswordSQL, UsuarioSQL } = userFR;
        const pool = await (0, database_1.dbConnection)(serverclientes, baseclientes, UsuarioSQL, PasswordSQL);
        const userquery = database_1.querys.getAuthLimitData;
        const requestUser = await pool.request().input('Id_Usuario', Id_Usuario).query(userquery);
        const user = requestUser.recordset[0];
        if (!pool) {
            throw new BadRequestError_1.default({ code: 500, message: "No se pudo establecer la conexión con la base de datos", logging: true });
        }
        let query = productsWeb_1.productsWebQuerys.getProducById;
        if (userFR.baseclientes === 'OLEIDB1_ROSCO' ||
            userFR.baseclientes === 'OLEIDB1_ROSCO_TEST') {
            // We have to modify query to ROSCO
            console.log("rosco");
            query = productsWeb_1.productsWebQuerys.getProducByIdROSCO;
        }
        ;
        const result = await pool.request()
            .input("Codigo", id)
            .input("Marca", Marca)
            .input("ListaPrecios", user.Id_ListPre)
            .input("Almacen", user.Id_Almacen)
            .input("baseSQL", baseclientes)
            .query(query);
        const product = result?.recordset[0];
        return res.json(product);
    }
    catch (error) {
        next(error);
    }
};
exports.getProducById = getProducById;
const getProductsByStock = async (req, res, next) => {
    try {
        const { PageNumber, PageSize } = productsValidations_1.getProductsByStockQuerySchema.parse(req.query);
        const sessionId = req.sessionID;
        const { products } = await (0, productsServices_1.getProductsByStockService)({
            sessionId,
            PageNumber,
            PageSize
        });
        res.json(products);
    }
    catch (error) {
        next(error);
    }
};
exports.getProductsByStock = getProductsByStock;
const getTotalOfProductsByStock = async (req, res, next) => {
    try {
        const Id_Usuario = req.id;
        const sessionId = req.sessionID;
        const { user: userFR } = await (0, getSession_1.handleGetSession)({ sessionId });
        if (!userFR) {
            throw new BadRequestError_1.default({ code: 401, message: "Sesion terminada", logging: true });
        }
        const { serverclientes, baseclientes, PasswordSQL, UsuarioSQL } = userFR;
        const pool = await (0, database_1.dbConnection)(serverclientes, baseclientes, UsuarioSQL, PasswordSQL);
        const userquery = database_1.querys.getAuthLimitData;
        const requestUser = await pool.request().input('Id_Usuario', Id_Usuario).query(userquery);
        const user = requestUser.recordset[0];
        if (!pool) {
            throw new BadRequestError_1.default({ code: 500, message: "No se pudo establecer la conexión con la base de datos", logging: true });
        }
        let query = products_1.productsQuerys.getTotalOfAllProductsByStock;
        const request = await pool.request()
            .input('Id_ListaPrecios', user.Id_ListPre)
            .input('Almacen', user.Id_Almacen)
            .query(query);
        const TotalProductos = request.recordset;
        res.json(TotalProductos);
    }
    catch (error) {
        next(error);
    }
};
exports.getTotalOfProductsByStock = getTotalOfProductsByStock;
const getProductByStockAndCodeBar = async (req, res, next) => {
    try {
        const { CodBar, Codigo } = req.query;
        const sessionId = req.sessionID;
        const { user: userFR } = await (0, getSession_1.handleGetSession)({ sessionId });
        if (!userFR) {
            throw new BadRequestError_1.default({ code: 401, message: "Sesion terminada", logging: true });
        }
        const { serverclientes, baseclientes, userId, PasswordSQL, UsuarioSQL } = userFR;
        const pool = await (0, database_1.dbConnection)(serverclientes, baseclientes, UsuarioSQL, PasswordSQL);
        const userquery = database_1.querys.getAuthLimitData;
        const requestUser = await pool.request().input('Id_Usuario', userId).query(userquery);
        const user = requestUser.recordset[0];
        if (!pool) {
            throw new BadRequestError_1.default({ code: 500, message: "No se pudo establecer la conexión con la base de datos", logging: true });
        }
        let isEAN13orUPC14 = false;
        if (CodBar) {
            isEAN13orUPC14 = (0, identifyBarcodeType_1.guessBarcodeType)(CodBar);
        }
        let request;
        if (isEAN13orUPC14) {
            let query = products_1.productsQuerys.getProductByStockAndCodeBarDV;
            request = await pool.request()
                .input("CodBar", CodBar === 'undefined' ? null : CodBar)
                .input('Id_ListaPrecios', user.Id_ListPre)
                .input('Id_Almacen', user.Id_Almacen)
                .query(query);
        }
        else {
            let query = products_1.productsQuerys.getProductByStockAndCodeBar;
            request = await pool.request()
                .input("CodBar", CodBar === 'undefined' ? null : CodBar)
                .input("Codigo", Codigo === 'undefined' ? null : Codigo)
                .input('Id_ListaPrecios', user.Id_ListPre)
                .input('Id_Almacen', user.Id_Almacen)
                .query(query);
        }
        const productByStockAndCodeBar = request.recordset;
        res.json(productByStockAndCodeBar);
    }
    catch (error) {
        next(error);
    }
};
exports.getProductByStockAndCodeBar = getProductByStockAndCodeBar;
//# sourceMappingURL=products.js.map
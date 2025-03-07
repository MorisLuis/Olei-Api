"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getProductByStockAndCodeBar = exports.getTotalOfProductsByStock = exports.getProductsByStock = exports.getProducById = void 0;
const database_1 = require("../../database");
const products_1 = require("../../database/querys/products");
const identifyBarcodeType_1 = require("../../utils/identifyBarcodeType");
const getSession_1 = require("../../utils/Redis/getSession");
const productsWeb_1 = require("../../database/querys/productsWeb");
const productsValidations_1 = require("../../validations/productsValidations");
const productsServices_1 = require("../../services/productsServices");
const CustomError_1 = require("../../errors/CustomError");
const getProducById = async (req, res, next) => {
    try {
        const { id } = req.params;
        const { Marca } = req.query;
        const Id_Usuario = req.Id_mobile;
        const sessionId = req.sessionID;
        const { user: userFR } = await (0, getSession_1.handleGetSession)({ sessionId });
        if (!userFR) {
            throw new CustomError_1.UnauthorizedError('Sesion terminada');
        }
        const { ServidorSQL, BaseSQL, PasswordSQL, UsuarioSQL, Id_Almacen, Id_ListPre } = userFR;
        const pool = await (0, database_1.dbConnection)(ServidorSQL, BaseSQL, UsuarioSQL, PasswordSQL);
        if (!pool) {
            throw new CustomError_1.ValidationError('Error al conectarse a base de datos principal');
        }
        let query = productsWeb_1.productsWebQuerys.getProducById;
        if (userFR.BaseSQL === 'OLEIDB1_ROSCO' ||
            userFR.BaseSQL === 'OLEIDB1_ROSCO_TEST') {
            // We have to modify query to ROSCO
            query = productsWeb_1.productsWebQuerys.getProducByIdROSCO;
        }
        ;
        const result = await pool.request()
            .input("Codigo", id)
            .input("Marca", Marca)
            .input("ListaPrecios", Id_ListPre)
            .input("Almacen", Id_Almacen)
            .input("baseSQL", BaseSQL)
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
        const Id_Usuario = req.Id_mobile;
        const sessionId = req.sessionID;
        const { user: userFR } = await (0, getSession_1.handleGetSession)({ sessionId });
        if (!userFR) {
            throw new CustomError_1.UnauthorizedError('Sesión terminada');
        }
        const { ServidorSQL, BaseSQL, PasswordSQL, UsuarioSQL, Id_Almacen, Id_ListPre } = userFR;
        const pool = await (0, database_1.dbConnection)(ServidorSQL, BaseSQL, UsuarioSQL, PasswordSQL);
        if (!pool) {
            throw new CustomError_1.ValidationError('Error al conectarse a base de datos principal');
        }
        let query = products_1.productsQuerys.getTotalOfAllProductsByStock;
        const request = await pool.request()
            .input('Id_ListaPrecios', Id_ListPre)
            .input('Almacen', Id_Almacen)
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
            throw new CustomError_1.UnauthorizedError('Sesion terminada');
        }
        const { ServidorSQL, BaseSQL, userId, PasswordSQL, UsuarioSQL, Id_Almacen, Id_ListPre } = userFR;
        const pool = await (0, database_1.dbConnection)(ServidorSQL, BaseSQL, UsuarioSQL, PasswordSQL);
        let isEAN13orUPC14 = false;
        if (CodBar) {
            isEAN13orUPC14 = (0, identifyBarcodeType_1.guessBarcodeType)(CodBar);
        }
        let request;
        if (isEAN13orUPC14) {
            let query = products_1.productsQuerys.getProductByStockAndCodeBarDV;
            request = await pool.request()
                .input("CodBar", CodBar === 'undefined' ? null : CodBar)
                .input('Id_ListaPrecios', Id_ListPre)
                .input('Id_Almacen', Id_Almacen)
                .query(query);
        }
        else {
            let query = products_1.productsQuerys.getProductByStockAndCodeBar;
            request = await pool.request()
                .input("CodBar", CodBar === 'undefined' ? null : CodBar)
                .input("Codigo", Codigo === 'undefined' ? null : Codigo)
                .input('Id_ListaPrecios', Id_ListPre)
                .input('Id_Almacen', Id_Almacen)
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
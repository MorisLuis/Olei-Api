"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.getProductByStockAndCodeBar = exports.getTotalOfProductsByStock = exports.getProductsByStock = exports.getProducById = exports.checkImageExists = void 0;
const database_1 = require("../../database");
const products_1 = require("../../database/querys/products");
const identifyBarcodeType_1 = require("../../utils/identifyBarcodeType");
const getSession_1 = require("../../utils/Redis/getSession");
const productsWeb_1 = require("../../database/querys/productsWeb");
const BadRequestError_1 = __importDefault(require("../../errors/BadRequestError"));
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
        const result = await pool.request()
            .input("Codigo", id)
            .input("Marca", Marca)
            .input("ListaPrecios", user.Id_ListPre)
            .input("Almacen", user.Id_Almacen)
            .input("baseSQL", baseclientes)
            .query(productsWeb_1.productsWebQuerys.getProducById);
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
        const { PageNumber, PageSize } = req.query;
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
        let query = products_1.productsQuerys.getAllProductsByStock;
        const request = await pool.request()
            .input('PageSize', Number(PageSize))
            .input('PageNumber', PageNumber)
            .input('Id_ListaPrecios', user.Id_ListPre)
            .input('Almacen', user.Id_Almacen)
            .query(query);
        const productsByStock = request.recordset;
        const { products } = await getImagesFromProducts({
            base: baseclientes,
            products: productsByStock
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
const getImagesFromProducts = async ({ base, products }) => {
    // Ahora, para cada producto, agrega la propiedad "imagen"
    for (const product of products) {
        // Supongamos que la URL de la imagen se basa en la propiedad "Codigo" del producto
        const baseSQL = base?.trim().toLowerCase().split(',');
        if (baseSQL && baseSQL.length > 0) {
            const formatImageDB = baseSQL[baseSQL.length - 1].split('_');
            const imageDB = formatImageDB[formatImageDB.length - 1];
            const imageUrl = `https://oleistorage.blob.core.windows.net/${imageDB}/${product.Codigo.trim()}.jpg`;
            // Verifica si la imagen existe antes de agregarla al producto
            const imageExists = await (0, exports.checkImageExists)(imageUrl);
            if (imageExists) {
                product.imagen = [{
                        url: imageUrl,
                        id: 1
                    }];
            }
        }
    }
    return { products };
};
const checkImageExists = async (url) => {
    try {
        const response = await fetch(url, { method: 'HEAD' });
        return response.ok;
    }
    catch (error) {
        console.error('Error during image check:', error);
        return false;
    }
};
exports.checkImageExists = checkImageExists;
//# sourceMappingURL=products.js.map
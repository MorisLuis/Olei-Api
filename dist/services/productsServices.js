"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.getProductsByStockService = void 0;
const database_1 = require("../database");
const products_1 = require("../database/querys/products");
const BadRequestError_1 = __importDefault(require("../errors/BadRequestError"));
const getSession_1 = require("../utils/Redis/getSession");
const getProductsByStockService = async ({ sessionId, PageSize, PageNumber }) => {
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
        .input('PageSize', PageSize)
        .input('PageNumber', PageNumber)
        .input('Id_ListaPrecios', user.Id_ListPre)
        .input('Almacen', user.Id_Almacen)
        .query(query);
    const productsByStock = request.recordset;
    return {
        products: productsByStock
    };
};
exports.getProductsByStockService = getProductsByStockService;
//# sourceMappingURL=productsServices.js.map
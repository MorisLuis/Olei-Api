"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.searchClient = exports.searchProduct = void 0;
const database_1 = require("../../database");
const mssql_1 = __importDefault(require("mssql"));
const products_1 = require("../../database/querys/products");
const getSession_1 = require("../../utils/Redis/getSession");
const BadRequestError_1 = __importDefault(require("../../errors/BadRequestError"));
const searchProduct = async (req, res, next) => {
    // Get session from REDIS.
    const sessionId = req.sessionRedis;
    const { user: userFR } = await (0, getSession_1.handleGetWebSession)({ sessionId });
    if (!userFR) {
        throw new BadRequestError_1.default({ code: 401, message: "Sesion terminada", logging: true });
    }
    const { Serverweb, Baseweb, Id_ListPre, SwSinStock, SwsinPrecio, Id_Almacen } = userFR;
    try {
        const { nombre, familia, codigo, marca } = req.query;
        const pool = await (0, database_1.dbConnection)(Serverweb, Baseweb);
        if (!pool) {
            throw new BadRequestError_1.default({ code: 500, message: "Unable to establish a connection to the database", logging: true });
        }
        // Execute the SQL query
        const result = await pool.request()
            .input('Descripcion', mssql_1.default.VarChar, nombre)
            .input('Id_ListaPrecios', mssql_1.default.Int, Id_ListPre)
            .input('Id_Almacen', mssql_1.default.Int, Id_Almacen)
            .input('Codigo', mssql_1.default.VarChar, codigo || "")
            .input('familia', mssql_1.default.VarChar, familia || "")
            .input('marca', mssql_1.default.VarChar, marca || "")
            .input('SwSinStock', mssql_1.default.Bit, SwSinStock === true ? 1 : 0)
            .input('SwsinPrecio', mssql_1.default.Bit, SwsinPrecio === true ? 1 : 0)
            .query(products_1.productsQuerys.getProductsBySearch);
        const products = result.recordset.map(row => row.Descripcion);
        res.json({
            total: products.length,
            products
        });
    }
    catch (error) {
        next(error);
    }
};
exports.searchProduct = searchProduct;
const searchClient = async (req, res, next) => {
    // Get session from REDIS.
    const sessionId = req.sessionRedis;
    const { user: userFR } = await (0, getSession_1.handleGetWebSession)({ sessionId });
    if (!userFR) {
        throw new BadRequestError_1.default({ code: 401, message: "Sesion terminada", logging: true });
    }
    const { Serverweb, Baseweb } = userFR;
    try {
        const pool = await (0, database_1.dbConnection)(Serverweb, Baseweb);
        if (!pool) {
            throw new BadRequestError_1.default({ code: 500, message: "Unable to establish a connection to the database", logging: true });
        }
        ;
        const { term } = req.query;
        let query = database_1.querys.getClientBySearch;
        const result = await pool.request()
            .input('nombre', mssql_1.default.VarChar, term)
            .query(query);
        const Clients = result.recordset;
        res.json({
            Clients
        });
    }
    catch (error) {
        next(error);
    }
};
exports.searchClient = searchClient;
//# sourceMappingURL=searchWeb.js.map
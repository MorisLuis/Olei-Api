"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.searchProductInventory = void 0;
const database_1 = require("../../database");
const products_1 = require("../../database/querys/products");
const getSession_1 = require("../../utils/Redis/getSession");
const BadRequestError_1 = __importDefault(require("../../errors/BadRequestError"));
/* CHANGED TO inventory.ts */
const searchProductInventory = async (req, res, next) => {
    try {
        const { searchTerm } = req.query;
        const sessionId = req.sessionID;
        const { user: userFR } = await (0, getSession_1.handleGetSession)({ sessionId });
        if (!userFR) {
            throw new BadRequestError_1.default({ code: 401, message: "Sesion terminada", logging: true });
        }
        const { serverclientes, baseclientes, userId, PasswordSQL, UsuarioSQL } = userFR;
        const Id_Usuario = req.id;
        const pool = await (0, database_1.dbConnection)(serverclientes, baseclientes, UsuarioSQL, PasswordSQL);
        const userquery = database_1.querys.getAuthLimitData;
        const requestUser = await pool.request().input('Id_Usuario', Id_Usuario).query(userquery);
        const user = requestUser.recordset[0];
        if (!pool) {
            throw new BadRequestError_1.default({ code: 500, message: "Unable to establish a connection to the database", logging: true });
        }
        const query = products_1.productsQuerys.getProductsBySearchInventory;
        const result = await pool.request()
            .input("searchTerm", searchTerm)
            .input('Id_ListaPrecios', user.Id_ListPre)
            .query(query);
        const products = result.recordset;
        res.json(products);
    }
    catch (error) {
        next(error);
    }
};
exports.searchProductInventory = searchProductInventory;
//# sourceMappingURL=search.js.map
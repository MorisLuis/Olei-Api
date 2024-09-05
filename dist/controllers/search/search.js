"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.searchProductInventory = void 0;
const database_1 = require("../../database");
const products_1 = require("../../database/querys/products");
const getSession_1 = require("../../utils/Redis/getSession");
const searchProductInventory = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { searchTerm } = req.query;
    const sessionId = req.sessionID;
    const { user: userFR } = yield (0, getSession_1.handleGetSession)({ sessionId });
    if (!userFR) {
        return res.status(400).json({ error: 'Sesion terminada' });
    }
    const { serverclientes, baseclientes, userId, PasswordSQL, UsuarioSQL } = userFR;
    const Id_Usuario = req.id;
    try {
        const pool = yield (0, database_1.dbConnection)(serverclientes, baseclientes, PasswordSQL, UsuarioSQL);
        const userquery = database_1.querys.getAuthLimitData;
        const requestUser = yield pool.request().input('Id_Usuario', Id_Usuario).query(userquery);
        const user = requestUser.recordset[0];
        if (!pool) {
            return res.status(500).json({ error: 'Unable to establish a connection to the database' });
        }
        const query = products_1.productsQuerys.getProductsBySearchInventory;
        const result = yield pool.request()
            .input("searchTerm", searchTerm)
            .input('Id_ListaPrecios', user.Id_ListPre)
            .query(query);
        const products = result.recordset;
        res.json(products);
    }
    catch (error) {
        console.log({ error });
    }
});
exports.searchProductInventory = searchProductInventory;
//# sourceMappingURL=search.js.map
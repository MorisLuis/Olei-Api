"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.searchProductInventory = void 0;
const database_1 = require("../../database");
const products_1 = require("../../database/querys/products");
const getSession_1 = require("../../utils/Redis/getSession");
const searchProductInventory = async (req, res) => {
    const { searchTerm } = req.query;
    const sessionId = req.sessionID;
    const { user: userFR } = await (0, getSession_1.handleGetSession)({ sessionId });
    if (!userFR) {
        return res.status(401).json({ error: 'Sesion terminada' });
    }
    const { serverclientes, baseclientes, userId, PasswordSQL, UsuarioSQL } = userFR;
    const Id_Usuario = req.id;
    try {
        const pool = await (0, database_1.dbConnection)(serverclientes, baseclientes, UsuarioSQL, PasswordSQL);
        const userquery = database_1.querys.getAuthLimitData;
        const requestUser = await pool.request().input('Id_Usuario', Id_Usuario).query(userquery);
        const user = requestUser.recordset[0];
        if (!pool) {
            return res.status(500).json({ error: 'Unable to establish a connection to the database' });
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
        console.log({ error });
    }
};
exports.searchProductInventory = searchProductInventory;
//# sourceMappingURL=search.js.map
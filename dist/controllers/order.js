"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.getOrderDetails = exports.getAllOrders = exports.getOrder = exports.postOrder = void 0;
const database_1 = require("../database");
const mssql_1 = __importDefault(require("mssql"));
const orders_1 = require("../database/querys/orders");
const getSession_1 = require("../utils/Redis/getSession");
const convertArrayToXml_1 = require("../utils/convertArrayToXml");
const numeroALetra_1 = require("../utils/numeroALetra");
const postOrder = async (req, res) => {
    // Get session from REDIS.
    const sessionId = req.sessionRedis;
    const { user: userFR } = await (0, getSession_1.handleGetWebSession)({ sessionId });
    if (!userFR) {
        return res.status(400).json({ error: 'Sesion terminada' });
    }
    const { Serverweb, Baseweb, Id_ListPre, Id_Cliente, Id_Almacen, TipoDocOO } = userFR;
    try {
        const pool = await (0, database_1.dbConnection)(Serverweb, Baseweb);
        if (!pool) {
            res.status(500).json({ error: 'No se pudo establecer la conexión con la base de datos' });
            return;
        }
        ;
        const { sellsDetails, sellsData } = req.body;
        const { Subtotal, Total } = sellsData ?? {};
        const transaction = new mssql_1.default.Transaction(pool);
        await transaction.begin();
        const request = new mssql_1.default.Request(transaction);
        const TotalImpuesto = Total - Subtotal + 1;
        const CantLetra = (0, numeroALetra_1.numeroALetra)(Total);
        const xmlDataSales = await (0, convertArrayToXml_1.convertArrayToXml)(sellsData);
        const xmlDataSalesDetails = await (0, convertArrayToXml_1.convertArrayToXml)(sellsDetails);
        const result = await request
            .input('xmlDataSales', mssql_1.default.Xml, xmlDataSales)
            .input('xmlDataSalesDetails', mssql_1.default.Xml, xmlDataSalesDetails)
            .input('Id_Usuario', mssql_1.default.Int, 1)
            .input('Id_Almacen', mssql_1.default.Int, Id_Almacen)
            .input('Id_Cliente', mssql_1.default.Int, Id_Cliente)
            .input('Id_ListPre', mssql_1.default.Int, Id_ListPre)
            .input('TipoDoc', mssql_1.default.Int, TipoDocOO)
            .input('CantLetra', mssql_1.default.VarChar, CantLetra)
            .input('TotalImpuesto', mssql_1.default.Decimal, TotalImpuesto)
            .output('Folio', mssql_1.default.Int)
            .execute('fn_ExecuteSales');
        await transaction.commit();
        const folio = result.recordset[0].Folio;
        res.status(201).json({
            ok: true,
            folio
        });
    }
    catch (error) {
        console.error('Error al crear el post:', error);
        res.status(500).json({ error: error });
    }
    finally {
        await (0, database_1.closeDbConnection)();
    }
};
exports.postOrder = postOrder;
const getOrder = async (req, res) => {
    // Get session from REDIS.
    const sessionId = req.sessionRedis;
    const { user: userFR } = await (0, getSession_1.handleGetWebSession)({ sessionId });
    if (!userFR) {
        return res.status(400).json({ error: 'Sesion terminada' });
    }
    const { Serverweb, Baseweb, TipoDocOO, Id_Cliente } = userFR;
    try {
        const { folio } = req.params;
        const pool = await (0, database_1.dbConnection)(Serverweb, Baseweb);
        if (!pool) {
            res.status(500).json({ error: 'No se pudo establecer la conexión con la base de datos' });
            return;
        }
        const getOrderQuery = orders_1.orderQuerys.getOrder;
        const request = await pool.request()
            .input('Id_Cliente', mssql_1.default.Int, Id_Cliente)
            .input('folio', mssql_1.default.Int, folio)
            .input('TipoDocOO', TipoDocOO)
            .query(getOrderQuery);
        let order = request.recordset[0];
        res.json(order);
    }
    catch (error) {
        res.status(500).json({ error: error });
    }
    finally {
        await (0, database_1.closeDbConnection)();
    }
};
exports.getOrder = getOrder;
const getAllOrders = async (req, res) => {
    // Get session from REDIS.
    const sessionId = req.sessionRedis;
    const { user: userFR } = await (0, getSession_1.handleGetWebSession)({ sessionId });
    if (!userFR) {
        return res.status(400).json({ error: 'Sesion terminada' });
    }
    const { Serverweb, Baseweb, TipoDocOO, Id_Cliente } = userFR;
    try {
        const pool = await (0, database_1.dbConnection)(Serverweb, Baseweb);
        if (!pool) {
            res.status(500).json({ error: 'No se pudo establecer la conexión con la base de datos' });
            return;
        }
        const query = orders_1.orderQuerys.getAllOrders;
        const request = await pool.request()
            .input('TipoDocOO', TipoDocOO)
            .input('Id_Cliente', mssql_1.default.Int, Id_Cliente)
            .query(query);
        let allOrders = request.recordset;
        res.json(allOrders);
    }
    catch (error) {
        console.log({ error });
        res.status(500).json({ error: error });
    }
    finally {
        await (0, database_1.closeDbConnection)();
    }
};
exports.getAllOrders = getAllOrders;
const getOrderDetails = async (req, res) => {
    // Get session from REDIS.
    const sessionId = req.sessionRedis;
    const { user: userFR } = await (0, getSession_1.handleGetWebSession)({ sessionId });
    if (!userFR) {
        return res.status(400).json({ error: 'Sesion terminada' });
    }
    ;
    const { Serverweb, Baseweb } = userFR;
    try {
        const { folio } = req.query;
        const pool = await (0, database_1.dbConnection)(Serverweb, Baseweb);
        if (!pool) {
            res.status(500).json({ error: 'No se pudo establecer la conexión con la base de datos' });
            return;
        }
        ;
        const query = orders_1.orderQuerys.getOrderDetails;
        const request = await pool.request()
            .input('folio', mssql_1.default.Int, folio)
            .query(query);
        let orderDetails = request.recordset;
        res.json(orderDetails);
    }
    catch (error) {
        res.status(500).json({ error: error });
    }
    finally {
        await (0, database_1.closeDbConnection)();
    }
};
exports.getOrderDetails = getOrderDetails;
//# sourceMappingURL=order.js.map
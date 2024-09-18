"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.getInventoryDetails = exports.getInventory = exports.postInventory = void 0;
const database_1 = require("../database");
const mssql_1 = __importDefault(require("mssql"));
const inventory_1 = require("../database/querys/inventory");
const currentTime_1 = require("../utils/currentTime");
const convertArrayToXml_1 = require("../utils/convertArrayToXml");
const getSession_1 = require("../utils/Redis/getSession");
const postInventory = async (req, res) => {
    const sessionId = req.sessionID;
    const { user: userFR } = await (0, getSession_1.handleGetSession)({ sessionId });
    if (!userFR) {
        return res.status(400).json({ error: 'Sesion terminada' });
    }
    const { serverclientes, baseclientes, PasswordSQL, UsuarioSQL } = userFR;
    const Id_Usuario = req.id;
    try {
        const pool = await (0, database_1.dbConnection)(serverclientes, baseclientes, UsuarioSQL, PasswordSQL);
        const { inventoryDetails, typeOfMovement } = req.body;
        const Accion = typeOfMovement?.Accion;
        const Id_TipoMovInv = typeOfMovement?.Id_TipoMovInv;
        const ExpectedRows = inventoryDetails.length;
        const ExpectedTotalQuantity = inventoryDetails.reduce((sum, item) => sum + item.Cantidad, 0);
        const transaction = new mssql_1.default.Transaction(pool);
        await transaction.begin();
        const request = new mssql_1.default.Request(transaction);
        // Get the inventory data.
        const inventoryData = {
            Estado: 1, // If it were 0 it would mean a inventory was cancelled
            Fecha: (0, currentTime_1.currentTime)(),
            Id_TipoMovInv: typeOfMovement?.Id_TipoMovInv,
            Id_AlmacenDest: 0,
            SwPendiente: 0,
            Descripcion: '',
            SwTr: 0,
            FolioReq: null,
            AlmReq: 0,
        };
        const xmlDataInventory = await (0, convertArrayToXml_1.convertArrayToXml)(inventoryData);
        const xmlDataInventoryDetails = await (0, convertArrayToXml_1.convertArrayToXml)(inventoryDetails);
        const result = await request
            .input('xmlDataInventory', mssql_1.default.Xml, xmlDataInventory)
            .input('xmlDataInventoryDetails', mssql_1.default.Xml, xmlDataInventoryDetails)
            .input('Accion', mssql_1.default.Int, Accion)
            .input('Id_TipoMovInv', mssql_1.default.Int, Id_TipoMovInv)
            .input('user', mssql_1.default.NVarChar(50), Id_Usuario)
            .input('ExpectedRows', mssql_1.default.Int, ExpectedRows)
            .input('ExpectedTotalQuantity', mssql_1.default.Decimal(18, 0), ExpectedTotalQuantity)
            .output('Folio', mssql_1.default.Int)
            .execute('fn_ExecuteInventory');
        const Folio = result.output.Folio;
        await transaction.commit();
        const inventory = result.recordset[0];
        res.json({ Folio, inventory });
    }
    catch (error) {
        console.log({ postInventoryError: error });
        res.status(500).json({ error: error });
    }
};
exports.postInventory = postInventory;
const getInventory = async (req, res) => {
    const { Folio } = req.query;
    try {
        const pool = await (0, database_1.dbConnection)();
        if (!pool) {
            res.status(500).json({ error: 'No se pudo establecer la conexión con la base de datos' });
            return;
        }
        const getInventoryQuery = inventory_1.inventoryQuerys.getInventory;
        const request = await pool.request()
            .input("Folio", Folio)
            .query(getInventoryQuery);
        let inventory = request.recordset[0];
        res.json(inventory);
    }
    catch (error) {
        console.log({ error });
        res.status(500).json({ error: error });
    }
};
exports.getInventory = getInventory;
const getInventoryDetails = async (req, res) => {
    const { Folio } = req.query;
    try {
        const pool = await (0, database_1.dbConnection)();
        if (!pool) {
            res.status(500).json({ error: 'No se pudo establecer la conexión con la base de datos' });
            return;
        }
        const getInventoryQuery = inventory_1.inventoryQuerys.getInventoryDetails;
        const request = await pool.request()
            .input("Folio", Folio)
            .query(getInventoryQuery);
        let inventoryDetails = request.recordset;
        res.json(inventoryDetails);
    }
    catch (error) {
        console.log({ error });
        res.status(500).json({ error: error });
    }
};
exports.getInventoryDetails = getInventoryDetails;
//# sourceMappingURL=inventory.js.map
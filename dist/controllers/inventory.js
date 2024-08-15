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
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.getInventoryDetails = exports.getInventory = exports.postInventory = void 0;
const database_1 = require("../database");
const mssql_1 = __importDefault(require("mssql"));
const inventory_1 = require("../database/querys/inventory");
const currentTime_1 = require("../utils/currentTime");
const storageApp_1 = require("../Storage/storageApp");
const convertArrayToXml_1 = require("../utils/convertArrayToXml");
const postInventory = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    var _a;
    const serverclientes = req.server;
    const baseclientes = req.base;
    const Id_Usuario = req.id;
    console.log({ serverclientes, baseclientes, Id_Usuario });
    try {
        const pool = yield (0, database_1.dbConnection)(serverclientes, baseclientes);
        const { inventoryDetails } = req.body;
        const dataStorage = (0, storageApp_1.getUserData)(`${Id_Usuario}_${baseclientes}`);
        const typeOfMovement = dataStorage === null || dataStorage === void 0 ? void 0 : dataStorage.Id_TipoMovInv;
        const Accion = typeOfMovement === null || typeOfMovement === void 0 ? void 0 : typeOfMovement.Accion;
        const Id_TipoMovInv = typeOfMovement === null || typeOfMovement === void 0 ? void 0 : typeOfMovement.Id_TipoMovInv;
        const ExpectedRows = inventoryDetails.length;
        const ExpectedTotalQuantity = inventoryDetails.reduce((sum, item) => sum + item.Cantidad, 0);
        ;
        const transaction = new mssql_1.default.Transaction(pool);
        yield transaction.begin();
        const request = new mssql_1.default.Request(transaction);
        // Get the inventory data.
        const inventoryData = {
            Estado: 1, // If it were 0 it would mean a inventory was cancelled
            Fecha: (0, currentTime_1.currentTime)(),
            Id_TipoMovInv: (_a = dataStorage === null || dataStorage === void 0 ? void 0 : dataStorage.Id_TipoMovInv) === null || _a === void 0 ? void 0 : _a.Id_TipoMovInv,
            Id_AlmacenDest: 0,
            SwPendiente: 0,
            Descripcion: '',
            SwTr: 0,
            FolioReq: null,
            AlmReq: 0,
        };
        const xmlDataInventory = yield (0, convertArrayToXml_1.convertArrayToXml)(inventoryData);
        const xmlDataInventoryDetails = yield (0, convertArrayToXml_1.convertArrayToXml)(inventoryDetails);
        const result = yield request
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
        yield transaction.commit();
        const inventory = result.recordset[0];
        res.json({ Folio, inventory });
    }
    catch (error) {
        console.log({ postInventoryError: error });
        res.status(500).json({ error: error });
    }
});
exports.postInventory = postInventory;
const getInventory = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { Folio } = req.query;
    try {
        const pool = yield (0, database_1.dbConnection)();
        if (!pool) {
            res.status(500).json({ error: 'No se pudo establecer la conexión con la base de datos' });
            return;
        }
        const getInventoryQuery = inventory_1.inventoryQuerys.getInventory;
        const request = yield pool.request()
            .input("Folio", Folio)
            .query(getInventoryQuery);
        let inventory = request.recordset[0];
        res.json(inventory);
    }
    catch (error) {
        console.log({ error });
        res.status(500).json({ error: error });
    }
});
exports.getInventory = getInventory;
const getInventoryDetails = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { Folio } = req.query;
    try {
        const pool = yield (0, database_1.dbConnection)();
        if (!pool) {
            res.status(500).json({ error: 'No se pudo establecer la conexión con la base de datos' });
            return;
        }
        const getInventoryQuery = inventory_1.inventoryQuerys.getInventoryDetails;
        const request = yield pool.request()
            .input("Folio", Folio)
            .query(getInventoryQuery);
        let inventoryDetails = request.recordset;
        res.json(inventoryDetails);
    }
    catch (error) {
        console.log({ error });
        res.status(500).json({ error: error });
    }
});
exports.getInventoryDetails = getInventoryDetails;
//# sourceMappingURL=inventory.js.map
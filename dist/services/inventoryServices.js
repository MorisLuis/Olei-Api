"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.postInventoryService = void 0;
const database_1 = require("../database");
const BadRequestError_1 = __importDefault(require("../errors/BadRequestError"));
const getSession_1 = require("../utils/Redis/getSession");
const convertArrayToXml_1 = require("../utils/convertArrayToXml");
const currentTime_1 = require("../utils/currentTime");
const mssql_1 = __importDefault(require("mssql"));
const postInventoryService = async ({ sessionId, inventoryDetails, typeOfMovement, Id_Usuario }) => {
    const { user: userFR } = await (0, getSession_1.handleGetSession)({ sessionId });
    if (!userFR) {
        throw new BadRequestError_1.default({ code: 401, message: "Sesion terminada", logging: true });
    }
    const { serverclientes, baseclientes, PasswordSQL, UsuarioSQL } = userFR;
    const pool = await (0, database_1.dbConnection)(serverclientes, baseclientes, UsuarioSQL, PasswordSQL);
    if (!pool) {
        throw new BadRequestError_1.default({ code: 500, message: `No se pudo establecer la conexión con la base de datos.`, logging: true });
    }
    ;
    const Accion = typeOfMovement.Accion;
    const Id_TipoMovInv = typeOfMovement.Id_TipoMovInv;
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
    return {
        Folio
    };
};
exports.postInventoryService = postInventoryService;
//# sourceMappingURL=inventoryServices.js.map
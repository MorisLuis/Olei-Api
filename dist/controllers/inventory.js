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
exports.postInventoryDetails = exports.postInventory = void 0;
const database_1 = require("../database");
const mssql_1 = __importDefault(require("mssql"));
const moment_1 = __importDefault(require("moment"));
const postInventory = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const postInventoryData = req.body;
        /*         const client = sharedData?.currentClient?.client;
                const connection = sharedData?.userConnection?.connection
                const Id_Almacen = client?.Id_Almacen;
                const Id_Usuario = connection?.user;
                const database = connection?.database; */
        const Id_Almacen = 1;
        const Id_Usuario = "MORADO";
        const database = "OLEIDB1";
        const pool = yield (0, database_1.dbConnection)();
        const transaction = new mssql_1.default.Transaction(pool);
        yield transaction.begin();
        // Get last Folio
        const Folio = yield pool.request().query('SELECT MAX(FOLIO) AS Folio FROM [dbo].[INVENTARIOS]');
        // Get data default.
        const Id_TipoMovInv = 0; // Physical movement
        const Estado = 1; // If it were 0 it would mean a inventory cancelled.
        const Id_AlmacenDest = 0;
        const SwPendiente = 0;
        const Descripcion = postInventoryData === null || postInventoryData === void 0 ? void 0 : postInventoryData.Descripcion;
        const SwTr = 0;
        const FolioReq = null;
        const AlmReq = 0;
        const Fecha = (0, moment_1.default)().format();
        const FechaRecepcion = Fecha;
        const postInventoryQuery = database_1.querys.insertInventory;
        const request = new mssql_1.default.Request(transaction);
        const result = yield request
            .input('Id_Almacen', mssql_1.default.Int, Id_Almacen)
            .input('Folio', mssql_1.default.Int, Folio.recordset[0].Folio + 1)
            .input('Id_TipoMovInv', mssql_1.default.Int, Id_TipoMovInv)
            .input('Estado', mssql_1.default.Int, Estado)
            .input('Fecha', mssql_1.default.DateTime, Fecha)
            .input('Id_AlmacenDest', mssql_1.default.Int, Id_AlmacenDest)
            .input('SwPendiente', mssql_1.default.SmallInt, SwPendiente)
            .input('Descripcion', mssql_1.default.VarChar(100), Descripcion)
            .input('Id_Usuario', mssql_1.default.VarChar(50), Id_Usuario)
            .input('SwTr', mssql_1.default.SmallInt, SwTr)
            .input('FechaRecepcion', mssql_1.default.DateTime, FechaRecepcion)
            .input('FolioReq', mssql_1.default.Int, FolioReq)
            .input('AlmReq', mssql_1.default.Int, AlmReq)
            .query(postInventoryQuery);
        yield transaction.commit();
        const inventory = result.recordset[0];
        res.json(inventory);
    }
    catch (error) {
        console.log({ error });
        res.status(500).json({ error: error });
    }
});
exports.postInventory = postInventory;
const postInventoryDetails = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const postInventoryDataArray = req.body;
        /* const client = sharedData?.currentClient?.client;
        const connection = sharedData?.userConnection?.connection
        const Id_Almacen = client?.Id_Almacen;
        const database = connection?.database; */
        const Id_Almacen = 1;
        const Id_Usuario = "MORADO";
        const database = "OLEIDB1";
        const pool = yield (0, database_1.dbConnection)();
        if (!pool) {
            res.status(500).json({ error: 'No se pudo establecer la conexión con la base de datos' });
            return;
        }
        const transaction = new mssql_1.default.Transaction(pool);
        yield transaction.begin();
        let countPartida = 0; // Increase the data of 'Partida'
        const inventoryDetails = []; // Store every inventoryDetails from the for.
        for (const postInventoryData of postInventoryDataArray) {
            const request = new mssql_1.default.Request(transaction);
            countPartida++;
            // Get last Folio
            const Folio = yield pool.request().query('SELECT MAX(FOLIO) AS Folio FROM [dbo].[DETALLEINVENTARIOS]');
            // Get data default.
            const Id_Ubicacion = 0;
            const SwNS = null;
            const NumsDeSerie = null;
            const SKU = null;
            const Diferencia = 0; // PENDING
            const postIntentoryDetailsQuery = database_1.querys.insertInventoryDetails;
            const result = yield request
                .input('Id_Almacen', mssql_1.default.Int, Id_Almacen)
                .input('Folio', mssql_1.default.Int, Folio.recordset[0].Folio + 1)
                .input('Partida', mssql_1.default.Int, countPartida)
                .input('Codigo', mssql_1.default.VarChar, postInventoryData.Codigo)
                .input('Id_Marca', mssql_1.default.Int, postInventoryData.Id_Marca)
                .input('Cantidad', mssql_1.default.Int, postInventoryData.Piezas)
                .input('Id_Ubicacion', mssql_1.default.Int, Id_Ubicacion)
                .input('Diferencia', mssql_1.default.Int, Diferencia)
                .input('SwNS', mssql_1.default.Int, SwNS)
                .input('NumsDeSerie', mssql_1.default.VarChar, NumsDeSerie)
                .input('SKU', mssql_1.default.Int, SKU)
                .query(postIntentoryDetailsQuery);
            inventoryDetails.push(result.recordset[0]);
        }
        yield transaction.commit();
        res.json(inventoryDetails);
    }
    catch (error) {
        console.log({ error });
        res.status(500).json({ error: error });
    }
});
exports.postInventoryDetails = postInventoryDetails;
//# sourceMappingURL=inventory.js.map
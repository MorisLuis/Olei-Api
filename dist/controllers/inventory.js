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
exports.getInventoryDetails = exports.getInventory = exports.postInventoryDetails = exports.postInventory = void 0;
const database_1 = require("../database");
const mssql_1 = __importDefault(require("mssql"));
const __1 = require("..");
const moment_1 = __importDefault(require("moment"));
const inventory_1 = require("../database/querys/inventory");
const postInventory = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    var _a, _b;
    try {
        const postInventoryData = req.body;
        const user = (_a = __1.sharedData === null || __1.sharedData === void 0 ? void 0 : __1.sharedData.currentUser) === null || _a === void 0 ? void 0 : _a.user;
        const Id_Almacen = user === null || user === void 0 ? void 0 : user.Id_Almacen;
        const connection = (_b = __1.sharedData === null || __1.sharedData === void 0 ? void 0 : __1.sharedData.userConnection) === null || _b === void 0 ? void 0 : _b.connection;
        const Id_Usuario = connection === null || connection === void 0 ? void 0 : connection.user;
        const pool = yield (0, database_1.dbConnection)();
        const transaction = new mssql_1.default.Transaction(pool);
        yield transaction.begin();
        // Get last Folio
        const Folio = yield pool.request().query('SELECT MAX(FOLIO) AS Folio FROM [dbo].[INVENTARIOS]');
        // Get data default.
        const Id_TipoMovInv = postInventoryData.Id_TipoMovInv;
        const Estado = 1; // If it were 0 it would mean a inventory was cancelled
        const Id_AlmacenDest = 0;
        const SwPendiente = 0;
        const Descripcion = postInventoryData === null || postInventoryData === void 0 ? void 0 : postInventoryData.Descripcion;
        const SwTr = 0;
        const FolioReq = null;
        const AlmReq = 0;
        const Fecha = (0, moment_1.default)().format();
        const FechaRecepcion = Fecha;
        const postInventoryQuery = inventory_1.inventoryQuerys.insertInventory;
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
const postInventoryDetails = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    //Receive products and with that create inventory Details.
    var _c, _d;
    try {
        const postInventoryDataArray = req.body;
        const user = (_c = __1.sharedData === null || __1.sharedData === void 0 ? void 0 : __1.sharedData.currentUser) === null || _c === void 0 ? void 0 : _c.user;
        const Id_Almacen = user === null || user === void 0 ? void 0 : user.Id_Almacen;
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
            // New Existence accord with the type of movement.
            const typeOfMovement = user === null || user === void 0 ? void 0 : user.Id_TipoMovInv;
            let updateValue = '@Cantidad_Existence';
            let difference = '@Cantidad_Existence - Existencia';
            const newExistence = () => {
                if ((typeOfMovement === null || typeOfMovement === void 0 ? void 0 : typeOfMovement.Accion) === 1 && typeOfMovement.Id_TipoMovInv === 0) { // Inventario fisico
                    updateValue = '@Cantidad_Existence'; // Asignar el valor directamente
                }
                else if ((typeOfMovement === null || typeOfMovement === void 0 ? void 0 : typeOfMovement.Accion) === 1 && typeOfMovement.Id_TipoMovInv === 1) { // Entrada
                    updateValue = 'Existencia + @Cantidad_Existence'; // Incrementar el valor existente
                    difference = 'Existencia - Existencia - @Cantidad_Existence';
                }
                else if ((typeOfMovement === null || typeOfMovement === void 0 ? void 0 : typeOfMovement.Accion) === 2) { // Salida
                    updateValue = 'Existencia - @Cantidad_Existence'; // Restar el valor existente
                }
                else if ((typeOfMovement === null || typeOfMovement === void 0 ? void 0 : typeOfMovement.Accion) === 3) { // Traspaso
                    updateValue = 'Existencia - @Cantidad_Existence'; // Restar el valor existente y despues se le tiene que sumar al otro almacen
                    difference = 'Existencia - Existencia - @Cantidad_Existence';
                }
            };
            newExistence();
            console.log({ postInventoryData: JSON.stringify(postInventoryData, null, 2) });
            const updateQuery = database_1.querys.updateExistenceTable(updateValue, difference);
            // UPDATE 'EXISTENCIAS' Table
            // If is transfer, first we rest the existence...
            const existenceUpdated = yield request
                .input('Cantidad_Existence', postInventoryData.Piezas)
                .input('Codigo_Existence', postInventoryData.Codigo)
                .input('Id_Marca_Existence', postInventoryData.Id_Marca)
                .input('Id_Almacen_Existence', Id_Almacen)
                .query(updateQuery);
            if ((typeOfMovement === null || typeOfMovement === void 0 ? void 0 : typeOfMovement.Accion) === 3) {
                updateValue = '@Cantidad_Existence_transfer';
                difference = '@Cantidad_Existence_transfer';
                const updateNewQuery = database_1.querys.updateExistenceTableTransfer(updateValue, difference);
                yield request
                    .input('Cantidad_Existence_transfer', postInventoryData.Piezas)
                    .input('Codigo_Existence_transfer', postInventoryData.Codigo)
                    .input('Id_Marca_Existence_transfer', postInventoryData.Id_Marca)
                    .input('Id_Almacen_Existence_transfer', (_d = user === null || user === void 0 ? void 0 : user.Id_TipoMovInv) === null || _d === void 0 ? void 0 : _d.Id_AlmDest)
                    .query(updateNewQuery);
            }
            const { Existencia, ExistenciaAnt } = existenceUpdated.recordset[0];
            // Get data default.
            const Id_Ubicacion = 0;
            const SwNS = null;
            const NumsDeSerie = null;
            const SKU = null;
            const Diferencia = Existencia - ExistenciaAnt;
            const postIntentoryDetailsQuery = inventory_1.inventoryQuerys.insertInventoryDetails;
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
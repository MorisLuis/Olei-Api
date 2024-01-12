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
exports.getAllOrders = exports.getOrder = exports.postOrder = void 0;
const database_1 = require("../database");
const mssql_1 = __importDefault(require("mssql"));
const moment_timezone_1 = __importDefault(require("moment-timezone"));
const app_1 = require("../app");
const postOrder = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    var _a, _b, _c;
    try {
        const postData = req.body;
        const client = (_a = app_1.sharedData === null || app_1.sharedData === void 0 ? void 0 : app_1.sharedData.currentClient) === null || _a === void 0 ? void 0 : _a.client;
        const user = (_b = app_1.sharedData === null || app_1.sharedData === void 0 ? void 0 : app_1.sharedData.currentUser) === null || _b === void 0 ? void 0 : _b.user;
        const connection = (_c = app_1.sharedData === null || app_1.sharedData === void 0 ? void 0 : app_1.sharedData.userConnection) === null || _c === void 0 ? void 0 : _c.connection;
        const Id_Almacen = client === null || client === void 0 ? void 0 : client.Id_Almacen;
        const Id_Cliente = client === null || client === void 0 ? void 0 : client.Id_Cliente;
        const Id_ListPre = client === null || client === void 0 ? void 0 : client.Id_ListPre;
        const database = connection === null || connection === void 0 ? void 0 : connection.database;
        const Id_Usuario = connection === null || connection === void 0 ? void 0 : connection.user;
        const pool = yield (0, database_1.dbConnection)();
        if (!pool) {
            res.status(500).json({ error: 'No se pudo establecer la conexión con la base de datos' });
            return;
        }
        const transaction = new mssql_1.default.Transaction(pool);
        yield transaction.begin();
        try {
            const request = new mssql_1.default.Request(transaction);
            const currentDate = (0, moment_timezone_1.default)().tz('America/Mexico_City').format('YYYY-MM-DD HH:mm:ss.SSS');
            const previewDataToPostOrder = yield request
                .input("Id_Almacen", Id_Almacen)
                .input("Id_Cliente", Id_Cliente)
                .input("database", database)
                .query(database_1.querys.getPreviewDataToPostOrder);
            // Accede a los resultados
            const results = previewDataToPostOrder.recordset[0];
            const { SerieActiva, Folio, Id_Descuento, Id_CondVta, Id_Vendedor, Id_FormaPago, Id_Transporte } = results;
            if (!results) {
                return res.status(404).json({ error: 'No se encontraron resultados en la consulta.' });
            }
            // Modifica la fecha en el objeto postData con el valor deseado
            postData.Id_Almacen = Id_Almacen;
            postData.TipoDoc = user === null || user === void 0 ? void 0 : user.TipoDocOO;
            postData.Serie = SerieActiva ? SerieActiva : "";
            postData.Folio = Folio + 1;
            postData.Id_Cliente = Id_Cliente;
            postData.Id_AlmacenClte = Id_Almacen;
            postData.Fecha = currentDate;
            postData.Total = postData.Total;
            postData.Impuesto = postData.Total - postData.Subtotal;
            postData.Subtotal = postData.Subtotal;
            postData.Saldo = postData.Total;
            postData.Id_Descuento = Id_Descuento;
            postData.Id_CondVta = Id_CondVta;
            postData.Id_Vendedor = Id_Vendedor;
            postData.Id_FormaPago = Id_FormaPago;
            postData.Id_Transporte = Id_Transporte;
            postData.FechaLiq = postData.Fecha;
            postData.Estado = 1;
            postData.Moneda = 1;
            postData.Paridad = 1;
            postData.Suma = postData.Subtotal;
            postData.Id_Usuario = Id_Usuario;
            postData.CantDescuento = 0;
            postData.Id_ListPre = Id_ListPre;
            postData.Id_TipoPago = 1;
            postData.TipoDocOrigen = 11;
            // Define la consulta SQL para la inserción de datos
            const postOrderQuery = database_1.querys.insertOrder;
            // Define una función para asignar los parámetros
            const assignParameter = (parameterName, sqlType, value) => {
                request.input(parameterName, sqlType, value);
            };
            // Define un objeto con los nombres de los parámetros y sus tipos de datos y valores
            const parameters = {
                Id_Almacen: { type: mssql_1.default.Int, value: postData.Id_Almacen },
                TipoDoc: { type: mssql_1.default.SmallInt, value: postData.TipoDoc },
                Serie: { type: mssql_1.default.NChar(10), value: postData.Serie },
                Folio: { type: mssql_1.default.Int, value: postData.Folio },
                Id_Cliente: { type: mssql_1.default.Int, value: postData.Id_Cliente },
                Id_AlmacenClte: { type: mssql_1.default.Int, value: postData.Id_AlmacenClte },
                Fecha: { type: mssql_1.default.DateTime, value: postData.Fecha },
                Subtotal: { type: mssql_1.default.Money, value: postData.Subtotal },
                Impuesto: { type: mssql_1.default.Decimal(18, 6), value: postData.Impuesto },
                Total: { type: mssql_1.default.Money, value: postData.Total },
                Saldo: { type: mssql_1.default.Money, value: postData.Saldo },
                Id_Descuento: { type: mssql_1.default.Int, value: postData.Id_Descuento },
                Id_CondVta: { type: mssql_1.default.Int, value: postData.Id_CondVta },
                Id_Vendedor: { type: mssql_1.default.Int, value: postData.Id_Vendedor },
                Id_Formapago: { type: mssql_1.default.Int, value: postData.Id_Formapago },
                Id_Transporte: { type: mssql_1.default.Int, value: postData.Id_Transporte },
                FechaLiq: { type: mssql_1.default.DateTime, value: postData.FechaLiq },
                Estado: { type: mssql_1.default.SmallInt, value: postData.Estado },
                Notas: { type: mssql_1.default.VarChar(4000), value: postData.Notas },
                DocsOrigen: { type: mssql_1.default.VarChar(4000), value: postData.DocsOrigen },
                DocsDestino: { type: mssql_1.default.VarChar(4000), value: postData.DocsDestino },
                TipoDocOrigen: { type: mssql_1.default.SmallInt, value: postData.TipoDocOrigen },
                TipoDocDestino: { type: mssql_1.default.SmallInt, value: postData.TipoDocDestino },
                Piezas: { type: mssql_1.default.Numeric(18, 2), value: postData.Piezas },
                Retencion: { type: mssql_1.default.Decimal(18, 6), value: postData.Retencion },
                RetencionIVA: { type: mssql_1.default.Decimal(18, 6), value: postData.RetencionIVA },
                Moneda: { type: mssql_1.default.Int, value: postData.Moneda },
                Paridad: { type: mssql_1.default.Decimal(18, 6), value: postData.Paridad },
                TipoEntrega: { type: mssql_1.default.SmallInt, value: postData.TipoEntrega },
                DatoOB1: { type: mssql_1.default.NChar(100), value: postData.DatoOB1 },
                DatoOB2: { type: mssql_1.default.NChar(100), value: postData.DatoOB2 },
                DatoOB3: { type: mssql_1.default.NChar(100), value: postData.DatoOB3 },
                NumCtaPago: { type: mssql_1.default.NChar(30), value: postData.NumCtaPago },
                Suma: { type: mssql_1.default.Decimal(18, 6), value: postData.Suma },
                SwImpOrg: { type: mssql_1.default.Bit, value: postData.SwImpOrg },
                SwPag: { type: mssql_1.default.Bit, value: postData.SwPag },
                Id_Usuario: { type: mssql_1.default.NChar(50), value: postData.Id_Usuario },
                CantDescuento: { type: mssql_1.default.Decimal(18, 6), value: postData.CantDescuento },
                Id_ListPre: { type: mssql_1.default.Int, value: postData.Id_ListPre },
                CantLetra: { type: mssql_1.default.VarChar(200), value: postData.CantLetra },
                Id_TipoPago: { type: mssql_1.default.Int, value: postData.Id_TipoPago },
                Id_Uso: { type: mssql_1.default.Int, value: postData.Id_Uso },
                ClaveConfirm: { type: mssql_1.default.NChar(20), value: postData.ClaveConfirm },
                SwAnticipo: { type: mssql_1.default.Bit, value: postData.SwAnticipo },
                SaldoAnticipo: { type: mssql_1.default.Decimal(18, 6), value: postData.SaldoAnticipo },
                DocsRel: { type: mssql_1.default.VarChar(200), value: postData.DocsRel },
                SwNotaAnticipo: { type: mssql_1.default.Bit, value: postData.SwNotaAnticipo },
                ImporteNotaAnticipo: { type: mssql_1.default.Decimal(18, 6), value: postData.ImporteNotaAnticipo },
                TipoRel: { type: mssql_1.default.Int, value: postData.TipoRel },
                Id_FormaPago2: { type: mssql_1.default.Int, value: postData.Id_FormaPago2 },
                Id_FormaPago3: { type: mssql_1.default.Int, value: postData.Id_FormaPago3 },
                Pago1: { type: mssql_1.default.Decimal(18, 6), value: postData.Pago1 },
                Pago2: { type: mssql_1.default.Decimal(18, 6), value: postData.Pago2 },
                Pago3: { type: mssql_1.default.Decimal(18, 6), value: postData.Pago3 },
                Cambio: { type: mssql_1.default.Decimal(18, 6), value: postData.Cambio },
                SwPagada: { type: mssql_1.default.Bit, value: postData.SwPagada },
                FolioCaja: { type: mssql_1.default.Int, value: postData.FolioCaja },
                Id_Chofer: { type: mssql_1.default.Int, value: postData.Id_Chofer },
                FechaEntrega: { type: mssql_1.default.DateTime, value: postData.FechaEntrega },
            };
            // Asigna los parámetros utilizando la función
            for (const parameterName in parameters) {
                if (Object.prototype.hasOwnProperty.call(parameters, parameterName)) {
                    const parameter = parameters[parameterName];
                    assignParameter(parameterName, parameter.type, parameter.value);
                }
            }
            // Ejecuta la consulta SQL dentro de la transacción
            yield request.query(postOrderQuery);
            // Confirma la transacción
            yield transaction.commit();
            res.status(201).json({
                order: request.parameters
            });
        }
        catch (error) {
            yield transaction.rollback();
            console.log({ error });
            throw error;
        }
        finally {
            if (pool) {
                yield pool.close();
            }
        }
    }
    catch (error) {
        console.error('Error al crear el post:', error);
        res.status(500).json({ error: error });
    }
});
exports.postOrder = postOrder;
const getOrder = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    var _d, _e;
    const { folio } = req.params;
    const client = (_d = app_1.sharedData === null || app_1.sharedData === void 0 ? void 0 : app_1.sharedData.currentClient) === null || _d === void 0 ? void 0 : _d.client;
    const connection = (_e = app_1.sharedData === null || app_1.sharedData === void 0 ? void 0 : app_1.sharedData.userConnection) === null || _e === void 0 ? void 0 : _e.connection;
    const Id_Cliente = client === null || client === void 0 ? void 0 : client.Id_Cliente;
    const database = connection === null || connection === void 0 ? void 0 : connection.database;
    try {
        const pool = yield (0, database_1.dbConnection)();
        if (!pool) {
            res.status(500).json({ error: 'No se pudo establecer la conexión con la base de datos' });
            return;
        }
        const getOrderQuery = database_1.querys.getOrder;
        const request = yield pool.request()
            .input("database", database)
            .input('Id_Cliente', mssql_1.default.Int, Id_Cliente)
            .input('folio', mssql_1.default.Int, folio)
            .query(getOrderQuery);
        let order = request.recordset[0];
        res.json(order);
    }
    catch (error) {
        res.status(500).json({ error: error });
    }
});
exports.getOrder = getOrder;
const getAllOrders = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    var _f, _g, _h;
    const user = (_f = app_1.sharedData === null || app_1.sharedData === void 0 ? void 0 : app_1.sharedData.currentUser) === null || _f === void 0 ? void 0 : _f.user;
    const client = (_g = app_1.sharedData === null || app_1.sharedData === void 0 ? void 0 : app_1.sharedData.currentClient) === null || _g === void 0 ? void 0 : _g.client;
    const Id_Cliente = client === null || client === void 0 ? void 0 : client.Id_Cliente;
    const connection = (_h = app_1.sharedData === null || app_1.sharedData === void 0 ? void 0 : app_1.sharedData.userConnection) === null || _h === void 0 ? void 0 : _h.connection;
    const database = connection === null || connection === void 0 ? void 0 : connection.database;
    const TipoDocOO = user === null || user === void 0 ? void 0 : user.TipoDocOO;
    try {
        const pool = yield (0, database_1.dbConnection)();
        if (!pool) {
            res.status(500).json({ error: 'No se pudo establecer la conexión con la base de datos' });
            return;
        }
        const query = database_1.querys.getAllOrders;
        const request = yield pool.request()
            .input('database', database)
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
});
exports.getAllOrders = getAllOrders;
//# sourceMappingURL=order.js.map
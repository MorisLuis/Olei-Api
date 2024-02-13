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
const __1 = require("..");
const postOrder = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    var _a, _b, _c;
    try {
        const postData = req.body;
        const client = (_a = __1.sharedData === null || __1.sharedData === void 0 ? void 0 : __1.sharedData.currentClient) === null || _a === void 0 ? void 0 : _a.client;
        const user = (_b = __1.sharedData === null || __1.sharedData === void 0 ? void 0 : __1.sharedData.currentUser) === null || _b === void 0 ? void 0 : _b.user;
        const connection = (_c = __1.sharedData === null || __1.sharedData === void 0 ? void 0 : __1.sharedData.userConnection) === null || _c === void 0 ? void 0 : _c.connection;
        const Id_Almacen = client === null || client === void 0 ? void 0 : client.Id_Almacen;
        const Id_Cliente = client === null || client === void 0 ? void 0 : client.Id_Cliente;
        const Id_ListPre = client === null || client === void 0 ? void 0 : client.Id_ListPre;
        const Id_Usuario = connection === null || connection === void 0 ? void 0 : connection.user;
        const TipoDocOO = user === null || user === void 0 ? void 0 : user.TipoDocOO;
        const pool = yield (0, database_1.dbConnection)();
        if (!pool) {
            res.status(500).json({ error: 'No se pudo establecer la conexión con la base de datos' });
            return;
        }
        if (!TipoDocOO) {
            res.status(500).json({ error: 'No se tiene TipoDocOO' });
            return;
        }
        const transaction = new mssql_1.default.Transaction(pool);
        yield transaction.begin();
        try {
            const request = new mssql_1.default.Request(transaction);
            const currentDate = (0, moment_timezone_1.default)().tz('America/Mexico_City').format('YYYY-MM-DD HH:mm:ss.SSS');
            const previewDataToPostOrder = yield request
                .input("Id_Almacen_Preview", Id_Almacen)
                .input("Id_Cliente_Preview", Id_Cliente)
                .query(database_1.querys.getPreviewDataToPostOrder);
            const results = previewDataToPostOrder.recordset[0];
            if (!results) {
                return res.status(404).json({ error: 'No se encontraron resultados en la consulta.' });
            }
            const { SerieActiva, Folio, Id_Descuento, Id_CondVta, Id_Vendedor, Id_FormaPago, Id_Transporte } = results;
            postData.TipoDoc = TipoDocOO;
            postData.Serie = SerieActiva ? SerieActiva : "";
            postData.Folio = (Folio ? Folio : 0) + 1;
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
            const postOrderQuery = database_1.querys.insertOrder;
            const result = yield request
                .input("Id_Almacen", mssql_1.default.Int, Id_Almacen)
                .input("TipoDoc", mssql_1.default.SmallInt, postData.TipoDoc)
                .input("Serie", mssql_1.default.NChar(10), postData.Serie)
                .input("Folio", mssql_1.default.Int, postData.Folio)
                .input("Id_Cliente", mssql_1.default.Int, postData.Id_Cliente)
                .input("Id_AlmacenClte", mssql_1.default.Int, postData.Id_AlmacenClte)
                .input("Fecha", mssql_1.default.DateTime, postData.Fecha)
                .input("Subtotal", mssql_1.default.Money, postData.Subtotal)
                .input("Impuesto", mssql_1.default.Decimal(18, 6), postData.Impuesto)
                .input("Total", mssql_1.default.Money, postData.Total)
                .input("Saldo", mssql_1.default.Money, postData.Saldo)
                .input("Id_Descuento", mssql_1.default.Int, postData.Id_Descuento)
                .input("Id_CondVta", mssql_1.default.Int, postData.Id_CondVta)
                .input("Id_Vendedor", mssql_1.default.Int, postData.Id_Vendedor)
                .input("Id_Formapago", mssql_1.default.Int, postData.Id_Formapago)
                .input("Id_Transporte", mssql_1.default.Int, postData.Id_Transporte)
                .input("FechaLiq", mssql_1.default.DateTime, postData.FechaLiq)
                .input("Estado", mssql_1.default.SmallInt, postData.Estado)
                .input("Notas", mssql_1.default.VarChar(4000), postData.Notas)
                .input("DocsOrigen", mssql_1.default.VarChar(4000), postData.DocsOrigen)
                .input("DocsDestino", mssql_1.default.VarChar(4000), postData.DocsDestino)
                .input("TipoDocOrigen", mssql_1.default.SmallInt, postData.TipoDocOrigen)
                .input("TipoDocDestino", mssql_1.default.SmallInt, postData.TipoDocDestino)
                .input("Piezas", mssql_1.default.Numeric(18, 2), postData.Piezas)
                .input("Retencion", mssql_1.default.Decimal(18, 6), postData.Retencion)
                .input("RetencionIVA", mssql_1.default.Decimal(18, 6), postData.RetencionIVA)
                .input("Moneda", mssql_1.default.Int, postData.Moneda)
                .input("Paridad", mssql_1.default.Decimal(18, 6), postData.Paridad)
                .input("TipoEntrega", mssql_1.default.SmallInt, postData.TipoEntrega)
                .input("DatoOB1", mssql_1.default.NChar(100), postData.DatoOB1)
                .input("DatoOB2", mssql_1.default.NChar(100), postData.DatoOB2)
                .input("DatoOB3", mssql_1.default.NChar(100), postData.DatoOB3)
                .input("NumCtaPago", mssql_1.default.NChar(30), postData.NumCtaPago)
                .input("Suma", mssql_1.default.Decimal(18, 6), postData.Suma)
                .input("SwImpOrg", mssql_1.default.Bit, postData.SwImpOrg)
                .input("SwPag", mssql_1.default.Bit, postData.SwPag)
                .input("Id_Usuario", mssql_1.default.NChar(50), postData.Id_Usuario)
                .input("CantDescuento", mssql_1.default.Decimal(18, 6), postData.CantDescuento)
                .input("Id_ListPre", mssql_1.default.Int, postData.Id_ListPre)
                .input("CantLetra", mssql_1.default.VarChar(200), postData.CantLetra)
                .input("Id_TipoPago", mssql_1.default.Int, postData.Id_TipoPago)
                .input("Id_Uso", mssql_1.default.Int, postData.Id_Uso)
                .input("ClaveConfirm", mssql_1.default.NChar(20), postData.ClaveConfirm)
                .input("SwAnticipo", mssql_1.default.Bit, postData.SwAnticipo)
                .input("SaldoAnticipo", mssql_1.default.Decimal(18, 6), postData.SaldoAnticipo)
                .input("DocsRel", mssql_1.default.VarChar(200), postData.DocsRel)
                .input("SwNotaAnticipo", mssql_1.default.Bit, postData.SwNotaAnticipo)
                .input("ImporteNotaAnticipo", mssql_1.default.Decimal(18, 6), postData.ImporteNotaAnticipo)
                .input("TipoRel", mssql_1.default.Int, postData.TipoRel)
                .input("Id_FormaPago2", mssql_1.default.Int, postData.Id_FormaPago2)
                .input("Id_FormaPago3", mssql_1.default.Int, postData.Id_FormaPago3)
                .input("Pago1", mssql_1.default.Decimal(18, 6), postData.Pago1)
                .input("Pago2", mssql_1.default.Decimal(18, 6), postData.Pago2)
                .input("Pago3", mssql_1.default.Decimal(18, 6), postData.Pago3)
                .input("Cambio", mssql_1.default.Decimal(18, 6), postData.Cambio)
                .input("SwPagada", mssql_1.default.Bit, postData.SwPagada)
                .input("FolioCaja", mssql_1.default.Int, postData.FolioCaja)
                .input("Id_Chofer", mssql_1.default.Int, postData.Id_Chofer)
                .input("FechaEntrega", mssql_1.default.DateTime, postData.FechaEntrega)
                .query(postOrderQuery);
            yield transaction.commit();
            const order = result.recordset[0];
            res.status(201).json(order);
        }
        catch (error) {
            yield transaction.rollback();
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
    const client = (_d = __1.sharedData === null || __1.sharedData === void 0 ? void 0 : __1.sharedData.currentClient) === null || _d === void 0 ? void 0 : _d.client;
    const Id_Cliente = client === null || client === void 0 ? void 0 : client.Id_Cliente;
    const user = (_e = __1.sharedData === null || __1.sharedData === void 0 ? void 0 : __1.sharedData.currentUser) === null || _e === void 0 ? void 0 : _e.user;
    const TipoDocOO = user === null || user === void 0 ? void 0 : user.TipoDocOO;
    try {
        const pool = yield (0, database_1.dbConnection)();
        if (!pool) {
            res.status(500).json({ error: 'No se pudo establecer la conexión con la base de datos' });
            return;
        }
        const getOrderQuery = database_1.querys.getOrder;
        const request = yield pool.request()
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
});
exports.getOrder = getOrder;
const getAllOrders = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    var _f, _g;
    const user = (_f = __1.sharedData === null || __1.sharedData === void 0 ? void 0 : __1.sharedData.currentUser) === null || _f === void 0 ? void 0 : _f.user;
    const client = (_g = __1.sharedData === null || __1.sharedData === void 0 ? void 0 : __1.sharedData.currentClient) === null || _g === void 0 ? void 0 : _g.client;
    const Id_Cliente = client === null || client === void 0 ? void 0 : client.Id_Cliente;
    const TipoDocOO = user === null || user === void 0 ? void 0 : user.TipoDocOO;
    try {
        const pool = yield (0, database_1.dbConnection)();
        if (!pool) {
            res.status(500).json({ error: 'No se pudo establecer la conexión con la base de datos' });
            return;
        }
        const query = database_1.querys.getAllOrders;
        const request = yield pool.request()
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
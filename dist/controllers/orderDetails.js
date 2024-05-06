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
exports.getOrderDetails = exports.postOrderDetails = void 0;
const database_1 = require("../database");
const mssql_1 = __importDefault(require("mssql"));
const __1 = require("..");
const orders_1 = require("../database/querys/orders");
const postOrderDetails = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    var _a, _b;
    try {
        const postArray = req.body;
        const client = (_a = __1.sharedData === null || __1.sharedData === void 0 ? void 0 : __1.sharedData.currentClient) === null || _a === void 0 ? void 0 : _a.client;
        const user = (_b = __1.sharedData === null || __1.sharedData === void 0 ? void 0 : __1.sharedData.currentUser) === null || _b === void 0 ? void 0 : _b.user;
        const Id_Almacen = client === null || client === void 0 ? void 0 : client.Id_Almacen;
        const Id_Cliente = client === null || client === void 0 ? void 0 : client.Id_Cliente;
        const Id_ListPre = client === null || client === void 0 ? void 0 : client.Id_ListPre;
        const pool = yield (0, database_1.dbConnection)();
        if (!pool) {
            res.status(500).json({ error: 'No se pudo establecer la conexión con la base de datos' });
            return;
        }
        const transaction = new mssql_1.default.Transaction(pool);
        try {
            yield transaction.begin();
            //const request = new sql.Request(transaction);
            let count = 0;
            const orderDetails = []; // Store every orderDetails from the for.
            for (const postData of postArray) {
                const request = new mssql_1.default.Request(transaction);
                count++;
                postData.Cantidad = postData.Piezas;
                const previewDataToPostOrderDetails = orders_1.orderQuerys.getPreviewDataToPostOrderDetails;
                const result = yield request
                    .input("Codigo_Preview", postData.Codigo)
                    .input("Id_Marca_Preview", postData.Id_Marca)
                    .input("Id_Almacen_Preview", Id_Almacen)
                    .input("Id_Cliente_Preview", Id_Cliente)
                    .query(previewDataToPostOrderDetails);
                const results = result.recordset[0];
                const { SerieActiva, Folio, Valor, Id_Unidad, SwNs, SKU, Costo } = results;
                if (!results) {
                    return res.status(404).json({ error: 'No se encontraron resultados en la consulta.' });
                }
                postData.Id_Almacen = Id_Almacen;
                postData.TipoDoc = user === null || user === void 0 ? void 0 : user.TipoDocOO;
                postData.Serie = SerieActiva ? SerieActiva : "";
                postData.Folio = (Folio ? Folio : 0) + 1;
                postData.Id_ListaPrecios = Id_ListPre;
                postData.Descuento = Valor;
                postData.Id_Unidad = Id_Unidad;
                postData.SwNs = SwNs;
                postData.TasaImpuesto = process.env.PUBLIC_TAX_RATE;
                postData.SKU = SKU;
                postData.Partida = count;
                postData.Importe = postData.Precio * postData.Piezas;
                postData.Impuesto = (postData.Precio * postData.Piezas * (postData.Impto / 100));
                postData.Costo = Costo;
                const postOrderDetailsQuery = orders_1.orderQuerys.insertOrderDetails;
                const resultOrderPost = yield request
                    .input("Id_Almacen", mssql_1.default.Int, Id_Almacen)
                    .input("TipoDoc", mssql_1.default.SmallInt, 3)
                    .input("Serie", mssql_1.default.NChar(10), postData.Serie)
                    .input("Folio", mssql_1.default.Int, postData.Folio)
                    .input("Codigo", mssql_1.default.NChar(20), postData.Codigo)
                    .input("Id_Marca", mssql_1.default.Int, postData.Id_Marca)
                    .input("Id_ListaPrecios", mssql_1.default.Int, postData.Id_ListaPrecios)
                    .input("Cantidad", mssql_1.default.Decimal(18, 6), postData.Cantidad)
                    .input("Precio", mssql_1.default.Decimal(18, 6), postData.Precio)
                    .input("Importe", mssql_1.default.Decimal(18, 6), postData.Importe)
                    .input("Impuesto", mssql_1.default.Decimal(18, 6), postData.Impuesto)
                    .input("Descripcion", mssql_1.default.VarChar(4000), postData.Descripcion)
                    .input("Descuento", mssql_1.default.Decimal(18, 6), postData.Descuento)
                    .input("Id_Unidad", mssql_1.default.Int, postData.Id_Unidad)
                    .input("SwNs", mssql_1.default.Bit, postData.SwNs)
                    .input("TasaImpuesto", mssql_1.default.Money, postData.TasaImpuesto)
                    .input("SKU", mssql_1.default.NChar(20), postData.SKU)
                    .input("Partida", mssql_1.default.SmallInt, postData.Partida)
                    .input("Costo", mssql_1.default.Decimal(18, 6), postData.Costo)
                    .query(postOrderDetailsQuery);
                orderDetails.push(resultOrderPost.recordset[0]);
            }
            yield transaction.commit();
            res.json(orderDetails);
        }
        catch (error) {
            console.log({ error });
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
        console.error('Error al crear el post:', error.message);
        res.status(500).json({ error: error });
    }
});
exports.postOrderDetails = postOrderDetails;
const getOrderDetails = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { folio } = req.query;
    if (!folio) {
        res.status(500).json({ error: 'No se envio el folio' });
        return;
    }
    try {
        const pool = yield (0, database_1.dbConnection)();
        if (!pool) {
            res.status(500).json({ error: 'No se pudo establecer la conexión con la base de datos' });
            return;
        }
        ;
        const query = orders_1.orderQuerys.getOrderDetails;
        const request = yield pool.request()
            .input('folio', mssql_1.default.Int, folio)
            .query(query);
        let orderDetails = request.recordset;
        res.json(orderDetails);
    }
    catch (error) {
        res.status(500).json({ error: error });
    }
});
exports.getOrderDetails = getOrderDetails;
//# sourceMappingURL=orderDetails.js.map
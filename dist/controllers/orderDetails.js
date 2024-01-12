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
const app_1 = require("../app");
const postOrderDetails = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    var _a, _b, _c;
    try {
        const postArray = req.body;
        const client = (_a = app_1.sharedData === null || app_1.sharedData === void 0 ? void 0 : app_1.sharedData.currentClient) === null || _a === void 0 ? void 0 : _a.client;
        const connection = (_b = app_1.sharedData === null || app_1.sharedData === void 0 ? void 0 : app_1.sharedData.userConnection) === null || _b === void 0 ? void 0 : _b.connection;
        const user = (_c = app_1.sharedData === null || app_1.sharedData === void 0 ? void 0 : app_1.sharedData.currentUser) === null || _c === void 0 ? void 0 : _c.user;
        //Temporal
        const Id_Almacen = client === null || client === void 0 ? void 0 : client.Id_Almacen;
        const Id_Cliente = client === null || client === void 0 ? void 0 : client.Id_Cliente;
        const Id_ListPre = client === null || client === void 0 ? void 0 : client.Id_ListPre;
        const database = connection === null || connection === void 0 ? void 0 : connection.database;
        const pool = yield (0, database_1.dbConnection)();
        if (!pool) {
            res.status(500).json({ error: 'No se pudo establecer la conexión con la base de datos' });
            return;
        }
        const transaction = new mssql_1.default.Transaction(pool);
        try {
            // Inicia la transacción
            yield transaction.begin();
            const request = new mssql_1.default.Request(transaction);
            let count = 0;
            for (const postData of postArray) {
                const request = new mssql_1.default.Request(transaction);
                count++;
                postData.Codigo = postData.Codigo;
                postData.Cantidad = postData.Piezas;
                const previewDataToPostOrderDetails = database_1.querys.getPreviewDataToPostOrderDetails;
                const result = yield request
                    .input("database", database)
                    .input("Codigo", postData.Codigo)
                    .input("Id_Marca", postData.Id_Marca)
                    .input("Id_Almacen", Id_Almacen)
                    .input("Id_Cliente", Id_Cliente)
                    .query(previewDataToPostOrderDetails);
                // Accede a los resultados
                const results = result.recordset[0];
                const { SerieActiva, Folio, Valor, Id_Unidad, SwNs, SKU, Costo } = results;
                if (!results) {
                    return res.status(404).json({ error: 'No se encontraron resultados en la consulta.' });
                }
                postData.Id_Almacen = Id_Almacen;
                postData.TipoDoc = user === null || user === void 0 ? void 0 : user.TipoDocOO;
                postData.Serie = SerieActiva ? SerieActiva : "";
                postData.Folio = Folio + 1;
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
                // Define la consulta SQL para la inserción de datos
                const postOrderDetailsQuery = database_1.querys.insertOrderDetails;
                // Define una función para asignar los parámetros
                const assignParameter = (parameterName, sqlType, value) => {
                    request.input(parameterName, sqlType, value);
                };
                const parameters = {
                    Id_Almacen: { type: mssql_1.default.Int, value: Id_Almacen },
                    TipoDoc: { type: mssql_1.default.SmallInt, value: 3 },
                    Serie: { type: mssql_1.default.NChar(10), value: postData.Serie },
                    Folio: { type: mssql_1.default.Int, value: postData.Folio },
                    Codigo: { type: mssql_1.default.NChar(20), value: postData.Codigo },
                    Id_Marca: { type: mssql_1.default.Int, value: postData.Id_Marca },
                    Id_ListaPrecios: { type: mssql_1.default.Int, value: postData.Id_ListaPrecios },
                    Cantidad: { type: mssql_1.default.Decimal(18, 6), value: postData.Cantidad },
                    Precio: { type: mssql_1.default.Decimal(18, 6), value: postData.Precio },
                    Importe: { type: mssql_1.default.Decimal(18, 6), value: postData.Importe },
                    Impuesto: { type: mssql_1.default.Decimal(18, 6), value: postData.Impuesto },
                    Descripcion: { type: mssql_1.default.VarChar(4000), value: postData.Descripcion },
                    Descuento: { type: mssql_1.default.Decimal(18, 6), value: postData.Descuento },
                    Id_Unidad: { type: mssql_1.default.Int, value: postData.Id_Unidad },
                    SwNs: { type: mssql_1.default.Bit, value: postData.SwNs },
                    TasaImpuesto: { type: mssql_1.default.Money, value: postData.TasaImpuesto },
                    SKU: { type: mssql_1.default.NChar(20), value: postData.SKU },
                    Partida: { type: mssql_1.default.SmallInt, value: postData.Partida },
                    Costo: { type: mssql_1.default.Decimal(18, 6), value: postData.Costo },
                };
                // Asigna los parámetros utilizando la función
                for (const parameterName in parameters) {
                    if (Object.prototype.hasOwnProperty.call(parameters, parameterName)) {
                        const parameter = parameters[parameterName];
                        assignParameter(parameterName, parameter.type, parameter.value);
                    }
                }
                // Ejecuta la consulta SQL dentro de la transacción
                yield request.query(postOrderDetailsQuery);
            }
            // Confirma la transacción
            yield transaction.commit();
            res.status(201).json({
                orderDetails: request.parameters
            });
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
        console.error('Error al crear el post:', error.message);
        res.status(500).json({ error: error });
    }
});
exports.postOrderDetails = postOrderDetails;
const getOrderDetails = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    var _d;
    const { folio } = req.query;
    const connection = (_d = app_1.sharedData === null || app_1.sharedData === void 0 ? void 0 : app_1.sharedData.userConnection) === null || _d === void 0 ? void 0 : _d.connection;
    const database = connection === null || connection === void 0 ? void 0 : connection.database;
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
        const query = database_1.querys.getOrderDetails;
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
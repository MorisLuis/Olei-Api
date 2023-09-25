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
    var _a, _b;
    try {
        const postArray = req.body;
        const client = (_a = app_1.sharedData === null || app_1.sharedData === void 0 ? void 0 : app_1.sharedData.currentClient) === null || _a === void 0 ? void 0 : _a.client;
        const connection = (_b = app_1.sharedData === null || app_1.sharedData === void 0 ? void 0 : app_1.sharedData.userConnection) === null || _b === void 0 ? void 0 : _b.connection;
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
                const firstQuery = `
                SELECT 
                    (SELECT Folio FROM [${database}].[dbo].[VENTAS] WHERE Folio = (SELECT MAX(Folio) FROM [${database}].[dbo].[VENTAS])) AS Folio,
                    (SELECT TRIM(SerieActiva) FROM [${database}].[dbo].[DATOSFISCALES] WHERE Id_Almacen = ${Id_Almacen}) AS SerieActiva,
                    (SELECT Id_Descuento FROM [${database}].[dbo].[CLIENTES] WHERE Id_Cliente = ${Id_Cliente} AND Id_Almacen = ${Id_Almacen}) AS Id_Descuento,
                    (SELECT Valor FROM [${database}].[dbo].[DESCUENTOS] WHERE Id_Descuento = (SELECT Id_Descuento FROM [${database}].[dbo].[CLIENTES] WHERE Id_Cliente = ${Id_Cliente} AND Id_Almacen = ${Id_Almacen})) AS Valor,
                    P.SwNs,
                    TRIM(P.SKU) AS SKU,
                    P.Id_Unidad AS Id_Unidad
                FROM [${database}].[dbo].[PRODUCTOS] AS P
                WHERE TRIM(P.Codigo) = '${postData.Codigo}'
            `;
                const result = yield request.query(firstQuery);
                // Accede a los resultados
                const results = result.recordset[0];
                if (!results) {
                    return res.status(404).json({ error: 'No se encontraron resultados en la consulta.' });
                }
                postData.Id_Almacen = Id_Almacen;
                postData.TipoDoc = 3;
                postData.Serie = results.SerieActiva ? results.SerieActiva : "";
                postData.Folio = results.Folio + 1;
                postData.Id_ListaPrecios = Id_ListPre;
                postData.Descuento = results === null || results === void 0 ? void 0 : results.Valor;
                postData.Id_Unidad = results === null || results === void 0 ? void 0 : results.Id_Unidad;
                postData.SwNs = results === null || results === void 0 ? void 0 : results.SwNs;
                postData.TasaImpuesto = process.env.PUBLIC_TAX_RATE;
                postData.SKU = results === null || results === void 0 ? void 0 : results.SKU;
                postData.Partida = count;
                // Define la consulta SQL para la inserción de datos
                const query = `
                        INSERT INTO [OLEIDB1].[dbo].[DETALLEVENTAS]  (
                            Id_Almacen, TipoDoc, Serie, Folio, Codigo, Id_Marca, Id_ListaPrecios, Cantidad,
                            Precio, Importe, Impuesto, Descripcion, Descuento, Id_Unidad, SwNs, TasaImpuesto, SKU, Partida
                        ) 
                        VALUES (
                            @Id_Almacen, @TipoDoc, @Serie, @Folio, @Codigo, @Id_Marca, @Id_ListaPrecios, @Cantidad,
                            @Precio, @Importe, @Impuesto, @Descripcion, @Descuento, @Id_Unidad, @SwNs, @TasaImpuesto, @SKU, @Partida
                        );
                    `;
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
                    Partida: { type: mssql_1.default.SmallInt, value: postData.Partida }
                };
                // Asigna los parámetros utilizando la función
                for (const parameterName in parameters) {
                    if (Object.prototype.hasOwnProperty.call(parameters, parameterName)) {
                        const parameter = parameters[parameterName];
                        assignParameter(parameterName, parameter.type, parameter.value);
                    }
                }
                // Ejecuta la consulta SQL dentro de la transacción
                yield request.query(query);
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
    var _c;
    const { folio } = req.query;
    const connection = (_c = app_1.sharedData === null || app_1.sharedData === void 0 ? void 0 : app_1.sharedData.userConnection) === null || _c === void 0 ? void 0 : _c.connection;
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
        const query = `
            SELECT D.Precio, D.Cantidad as Piezas, D.Importe, D.Impuesto, D.Id_Marca, D.Id_Almacen, D.Id_ListaPrecios, D.Folio, TRIM(D.Descripcion) AS Descripcion, TRIM(D.Codigo) AS Codigo, E.Existencia
            FROM [${database}].[dbo].[DETALLEVENTAS] AS D
            INNER JOIN [${database}].[dbo].[EXISTENCIAS] AS E ON D.Codigo = E.Codigo AND D.Id_Marca = E.Id_Marca AND D.Id_Almacen = E.Id_Almacen
            WHERE Folio = @folio
            ORDER BY Folio DESC
        `;
        const request = pool.request();
        request.input('folio', mssql_1.default.Int, folio);
        const consult = yield request.query(query);
        let results = consult.recordset;
        res.json(results);
    }
    catch (error) {
        res.status(500).json({ error: error });
    }
});
exports.getOrderDetails = getOrderDetails;
//# sourceMappingURL=orderDetails.js.map
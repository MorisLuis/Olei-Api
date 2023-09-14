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
exports.getTotalProducts = exports.getProducById = exports.getProducts = void 0;
const app_1 = require("../app");
const database_1 = require("../database");
const mssql_1 = __importDefault(require("mssql"));
function executeQuery(pool, query, params) {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            // Execute the query with provided parameters
            const result = yield pool.request()
                .input('ListaPrecios', mssql_1.default.Int, params.ListaPrecios)
                .input('Almacen', mssql_1.default.Int, params.Almacen)
                .query(query);
            return result.recordset;
        }
        catch (error) {
            throw error;
        }
    });
}
const getProducts = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    var _a;
    const { nombre, marca, familia, folio, enStock, page, limit } = req.query;
    // Get the user information from shared data, including the user's warehouse (Almacen)
    const user = (_a = app_1.sharedData === null || app_1.sharedData === void 0 ? void 0 : app_1.sharedData.currentUser) === null || _a === void 0 ? void 0 : _a.user;
    const userAlmacen = (user === null || user === void 0 ? void 0 : user.Id_Almacen) || 1; // Default to 1 if user.Id_Almacen is undefined
    // CONDICIONAR SI ES EMPLEADO USAR UN ID_LISTAPRECIOS DEL CLIENTE.
    // PROVIENE DEL QUERY
    try {
        const pool = yield (0, database_1.dbConnection)();
        if (!pool) {
            res.status(500).json({ error: 'No se pudo establecer la conexión con la base de datos' });
            return;
        }
        // Define query parameters for the SQL query
        const params = {
            ListaPrecios: 1,
            Almacen: userAlmacen, // User's warehouse
        };
        let query = database_1.querys.getAllProducts;
        if (nombre) {
            query += ` AND (LOWER(P.Descripcion) LIKE '%' + LOWER('${nombre}') + '%')`;
        }
        if (marca && marca !== 'undefined') {
            query += ` AND (LOWER(M.Nombre) LIKE '%' + LOWER('${marca}') + '%')`;
        }
        if (familia && familia !== 'undefined') {
            query += ` AND (LOWER(F.Nombre) LIKE '%' + LOWER('${familia}') + '%')`;
        }
        if (folio && folio !== 'undefined') {
            query += ` AND (LOWER(P.Codigo) LIKE '%' + LOWER('${folio}') + '%')`;
        }
        if (enStock === 'true') {
            query += ' AND E.Existencia > 0';
        }
        let paginationQuery = '';
        // Check if pagination parameters are provided
        if (page && limit) {
            const pageNumber = parseInt(page) || 1;
            const limitNumber = parseInt(limit) || 20;
            const offset = (pageNumber - 1) * limitNumber;
            paginationQuery = `
                SELECT *
                FROM (
                    ${query.replace('SELECT DISTINCT', 'SELECT ROW_NUMBER() OVER(ORDER BY P.Codigo) AS RowNum,')}
                ) AS NumberedResults
                WHERE RowNum > ${offset}
                AND RowNum <= ${offset + limitNumber}
            `;
        }
        // Use the pagination query if available; otherwise, use the base query
        const finalQuery = paginationQuery || query;
        // Execute the parameterized query
        const products = yield executeQuery(pool, finalQuery, params);
        // Get the total count without pagination
        const total = products.length;
        res.json({
            total,
            page: page ? parseInt(page) : 1,
            limit: limit ? parseInt(limit) : 20,
            products
        });
    }
    catch (error) {
        res.status(500).json({ error: error.message });
    }
});
exports.getProducts = getProducts;
const getProducById = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const pool = yield (0, database_1.dbConnection)();
        const result = yield (pool === null || pool === void 0 ? void 0 : pool.request().input("id", req.params.id).query(database_1.querys.getProducById));
        return res.json(result === null || result === void 0 ? void 0 : result.recordset[0]);
    }
    catch (error) {
        res.status(500);
        res.send(error.message);
    }
});
exports.getProducById = getProducById;
const getTotalProducts = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const pool = yield (0, database_1.dbConnection)();
    const result = yield (pool === null || pool === void 0 ? void 0 : pool.request().query(database_1.querys.getTotalProducts));
    res.json(result === null || result === void 0 ? void 0 : result.recordset[0][""]);
});
exports.getTotalProducts = getTotalProducts;
//# sourceMappingURL=products.js.map
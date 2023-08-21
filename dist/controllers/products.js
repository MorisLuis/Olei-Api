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
Object.defineProperty(exports, "__esModule", { value: true });
exports.getTotalProducts = exports.deleteProductById = exports.getProducById = exports.getProducts = void 0;
const database_1 = require("../database");
const getProducts = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { nombre, marca, familia, folio, enStock, page, limit } = req.query;
    try {
        const pool = yield (0, database_1.dbConnection)();
        if (!pool) {
            res.status(500).json({ error: 'No se pudo establecer la conexión con la base de datos' });
            return;
        }
        let query = database_1.querys.getAllProducts;
        if (nombre) {
            query += ` AND (LOWER(P.Descripcion) LIKE '%' + LOWER('${nombre}') + '%')`;
        }
        if (marca) {
            query += ` AND (LOWER(M.Nombre) LIKE '%' + LOWER('${marca}') + '%')`;
        }
        if (familia) {
            query += ` AND (LOWER(F.Nombre) LIKE '%' + LOWER('${familia}') + '%')`;
        }
        if (folio) {
            query += ` AND (LOWER(P.Codigo) LIKE '%' + LOWER('${folio}') + '%')`;
        }
        if (enStock === 'true') {
            query += ' AND E.Existencia > 0';
        }
        let paginationQuery = '';
        if (page && limit) {
            const pageNumber = parseInt(page) || 1;
            const limitNumber = parseInt(limit) || 10;
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
        const finalQuery = paginationQuery || query;
        const result = yield pool.request().query(finalQuery);
        // Get the total count without pagination
        const total = result.recordset.length;
        res.json({
            total,
            page: page ? parseInt(page) : 1,
            limit: limit ? parseInt(limit) : 10,
            products: result.recordset,
        });
        //await pool.close();
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
const deleteProductById = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const pool = yield (0, database_1.dbConnection)();
        const result = yield (pool === null || pool === void 0 ? void 0 : pool.request().input("id", req.params.id).query(database_1.querys.deleteProduct));
        if ((result === null || result === void 0 ? void 0 : result.rowsAffected[0]) === 0)
            return res.sendStatus(404);
        return res.sendStatus(204);
    }
    catch (error) {
        res.status(500);
        res.send(error.message);
    }
});
exports.deleteProductById = deleteProductById;
const getTotalProducts = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const pool = yield (0, database_1.dbConnection)();
    const result = yield (pool === null || pool === void 0 ? void 0 : pool.request().query(database_1.querys.getTotalProducts));
    res.json(result === null || result === void 0 ? void 0 : result.recordset[0][""]);
});
exports.getTotalProducts = getTotalProducts;
//# sourceMappingURL=products.js.map
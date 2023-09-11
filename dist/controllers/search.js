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
exports.searchClient = exports.searchProduct = void 0;
const app_1 = require("../app");
const database_1 = require("../database");
const searchProduct = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    var _a, _b;
    const { nombre, familia, codigo, enStock, marca } = req.query;
    // Get the user's almacen (storage) ID, default to 1 if not available
    const userAlmacen = ((_b = (_a = app_1.sharedData === null || app_1.sharedData === void 0 ? void 0 : app_1.sharedData.currentUser) === null || _a === void 0 ? void 0 : _a.user) === null || _b === void 0 ? void 0 : _b.Id_Almacen) || 1;
    try {
        const pool = yield (0, database_1.dbConnection)();
        if (!pool) {
            return res.status(500).json({ error: 'Unable to establish a connection to the database' });
        }
        // Initialize the base query with the common part
        let query = `${database_1.querys.getProductsBySearch}`;
        // Split the search term into individual words
        const searchTerms = typeof nombre === 'string' ? nombre.split(' ') : [];
        // Check if there are search terms
        if (searchTerms.length > 0) {
            // Create an array of LIKE conditions for each search term
            const likeConditions = searchTerms.map(word => `LOWER(P.Descripcion) LIKE '%' + LOWER('${word}') + '%'`);
            const whereClause = likeConditions.join(' AND ');
            // Build the dynamic SQL query based on query parameters
            if (codigo || familia || marca || (enStock === 'true' && codigo === undefined)) {
                if (familia) {
                    query += ` JOIN [OLEIDB1].[dbo].[FAMILIAS] F ON P.Id_Familia = F.Id_Familia`;
                }
                if (marca) {
                    query += ` JOIN [OLEIDB1].[dbo].[MARCAS] M ON PR.Id_Marca = M.Id_Marca`;
                }
                query += ` WHERE (${whereClause}) AND PR.Id_ListaPrecios = 1 AND E.Id_Almacen = ${userAlmacen}`;
                if (codigo) {
                    query += ` AND (LOWER(P.Codigo) LIKE '%' + LOWER('${codigo}') + '%')`;
                }
                if (familia) {
                    query += ` AND (LOWER(F.Nombre) LIKE '%' + LOWER('${familia}') + '%')`;
                }
                if (marca) {
                    query += ` AND (LOWER(M.Nombre) LIKE '%' + LOWER('${marca}') + '%')`;
                }
                if (enStock === 'true') {
                    query += ' AND E.Existencia > 0';
                }
            }
            else {
                // If no specific parameters are provided, apply the WHERE clause with search terms and default filters
                query += ` WHERE (${whereClause}) AND PR.Id_ListaPrecios = 1 AND E.Id_Almacen = ${userAlmacen}`;
            }
        }
        // Execute the SQL query
        const result = yield pool.request().query(query);
        // Calculate the total number of results
        const total = result.recordset.length;
        // Extract the descriptions of the first 10 products for response
        const descriptions = result.recordset.slice(0, 10).map(product => product.Descripcion);
        // Send the response with total results and product descriptions
        res.json({
            total,
            products: descriptions
        });
    }
    catch (error) {
        // Handle errors and send an error response if necessary
        res.status(500).json({ error: error.message });
    }
});
exports.searchProduct = searchProduct;
const searchClient = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { term } = req.query;
    try {
        const pool = yield (0, database_1.dbConnection)();
        if (!pool) {
            return res.status(500).json({ error: 'Unable to establish a connection to the database' });
        }
        let query = database_1.querys.getClientBySearch;
        query += `WHERE LOWER(C.Nombre) LIKE '%' + LOWER('${term}') + '%'`;
        // Execute the SQL query
        const result = yield pool.request().query(query);
        const Clients = result.recordset;
        res.json({
            Clients
        });
    }
    catch (error) {
        res.status(500).json({ error: error.message });
    }
});
exports.searchClient = searchClient;
//# sourceMappingURL=search.js.map
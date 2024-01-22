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
exports.getProductByStockAndCodeBar = exports.getProductsByStock = exports.getTotalProducts = exports.getProducById = exports.getProducts = void 0;
const app_1 = require("../app");
const database_1 = require("../database");
const mssql_1 = __importDefault(require("mssql"));
const node_fetch_1 = __importDefault(require("node-fetch"));
const getProducts = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    var _a, _b;
    const { nombre, marca, familia, folio, enStock, page, limit } = req.query;
    // Get the user information from shared data, including the user's warehouse (Almacen)
    const client = (_a = app_1.sharedData === null || app_1.sharedData === void 0 ? void 0 : app_1.sharedData.currentClient) === null || _a === void 0 ? void 0 : _a.client;
    const user = (_b = app_1.sharedData.currentUser) === null || _b === void 0 ? void 0 : _b.user;
    const userAlmacen = client === null || client === void 0 ? void 0 : client.Id_Almacen;
    const userListPrice = client === null || client === void 0 ? void 0 : client.Id_ListPre;
    try {
        const pool = yield (0, database_1.dbConnection)();
        if (!pool) {
            res.status(500).json({ error: 'No se pudo establecer la conexión con la base de datos' });
            return;
        }
        // Define query parameters for the SQL query
        const params = {
            ListaPrecios: userListPrice,
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
        // Dont show products without stock
        if (!(user === null || user === void 0 ? void 0 : user.SwSinStock)) {
            query += ' AND E.Existencia > 0';
        }
        // Dont show products without price
        if (!(user === null || user === void 0 ? void 0 : user.SwsinPrecio)) {
            query += 'AND PR.Precio > 0';
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
        if (user === null || user === void 0 ? void 0 : user.SwImagenes) {
            // Ahora, para cada producto, agrega la propiedad "imagen"
            for (const product of products) {
                // Supongamos que la URL de la imagen se basa en la propiedad "Codigo" del producto
                const baseSQL = user === null || user === void 0 ? void 0 : user.BaseSQL.trim().toLowerCase().split(',');
                if (baseSQL && baseSQL.length > 0) {
                    const imageDB = baseSQL[baseSQL.length - 1];
                    const imageUrl = `https://oleistorage.blob.core.windows.net/${imageDB}/${product.Codigo.trim()}.jpg`;
                    // Verifica si la imagen existe antes de agregarla al producto
                    const imageExists = yield checkImageExists(imageUrl);
                    if (imageExists) {
                        product.imagen = [{
                                url: imageUrl,
                                id: 1
                            }];
                    }
                }
            }
        }
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
    var _c, _d;
    const { id } = req.params;
    const { Marca } = req.query;
    const client = (_c = app_1.sharedData === null || app_1.sharedData === void 0 ? void 0 : app_1.sharedData.currentClient) === null || _c === void 0 ? void 0 : _c.client;
    const userAlmacen = client === null || client === void 0 ? void 0 : client.Id_Almacen;
    const userListPrice = client === null || client === void 0 ? void 0 : client.Id_ListPre;
    const user = (_d = app_1.sharedData.currentUser) === null || _d === void 0 ? void 0 : _d.user;
    try {
        const pool = yield (0, database_1.dbConnection)();
        if (!pool) {
            return res.status(500).json({ error: 'No se pudo establecer la conexión con la base de datos' });
        }
        const result = yield pool.request()
            .input("Codigo", id)
            .input("Marca", Marca)
            .input("ListaPrecios", userListPrice)
            .input("Almacen", userAlmacen)
            .query(database_1.querys.getProducById);
        const product = result === null || result === void 0 ? void 0 : result.recordset[0];
        if (user === null || user === void 0 ? void 0 : user.SwImagenes) {
            const baseSQL = user === null || user === void 0 ? void 0 : user.BaseSQL.trim().toLowerCase().split(',');
            if (baseSQL && baseSQL.length > 0) {
                const imageDB = baseSQL[baseSQL.length - 1];
                // Número máximo de intentos para encontrar la imagen
                const maxAttempts = 5;
                let attempt = 0;
                let images = [];
                while (attempt < maxAttempts) {
                    let imageUrl;
                    if (attempt === 0) {
                        imageUrl = `https://oleistorage.blob.core.windows.net/${imageDB}/${product.Codigo.trim()}.jpg`;
                    }
                    else {
                        imageUrl = `https://oleistorage.blob.core.windows.net/${imageDB}/${product.Codigo.trim()}_${attempt}.jpg`;
                    }
                    // Verifica si la imagen existe
                    const imageExists = yield checkImageExists(imageUrl);
                    if (imageExists) {
                        images.push({
                            url: imageUrl,
                            id: attempt
                        });
                    }
                    attempt++;
                }
                if (images.length > 0) {
                    // Se encontraron imágenes existentes
                    product.imagen = images;
                }
            }
        }
        return res.json(product);
    }
    catch (error) {
        return res.status(500).json({ error: 'Ocurrió un error al procesar la solicitud' });
    }
});
exports.getProducById = getProducById;
const getTotalProducts = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const pool = yield (0, database_1.dbConnection)();
    const result = yield (pool === null || pool === void 0 ? void 0 : pool.request().query(database_1.querys.getTotalProducts));
    res.json(result === null || result === void 0 ? void 0 : result.recordset[0][""]);
});
exports.getTotalProducts = getTotalProducts;
const getProductsByStock = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { PageNumber, PageSize } = req.query;
    try {
        const pool = yield (0, database_1.dbConnection)();
        if (!pool) {
            res.status(500).json({ error: 'No se pudo establecer la conexión con la base de datos' });
        }
        let query = database_1.querys.getAllProductsByStock;
        const request = yield pool.request()
            .input('PageSize', Number(PageSize))
            .input('PageNumber', PageNumber)
            .query(query);
        const productsByStock = request.recordset;
        res.json(productsByStock);
    }
    catch (error) {
        console.log({ error });
        res.status(500).json({ error: error.message });
    }
});
exports.getProductsByStock = getProductsByStock;
const getProductByStockAndCodeBar = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { CodeBar } = req.params;
    try {
        const pool = yield (0, database_1.dbConnection)();
        if (!pool) {
            return res.status(500).json({ error: 'No se pudo establecer la conexión con la base de datos' });
        }
        let query = database_1.querys.getProductByStockAndCodeBar;
        const request = yield pool.request()
            .input("CodeBar", CodeBar)
            .query(query);
        const productByStockAndCodeBar = request.recordset;
        res.json(productByStockAndCodeBar);
    }
    catch (error) {
        return res.status(500).json({ error: 'Ocurrió un error al procesar la solicitud' });
    }
});
exports.getProductByStockAndCodeBar = getProductByStockAndCodeBar;
// Utils
const checkImageExists = (url) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const response = yield (0, node_fetch_1.default)(url, { method: 'HEAD' });
        return response.ok;
    }
    catch (error) {
        console.error('Error during image check:', error);
        return false;
    }
});
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
//# sourceMappingURL=products.js.map
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
exports.getTotalProducts = exports.getProducByIdWeb = exports.getProducts = void 0;
const database_1 = require("../../database");
const products_1 = require("../../database/querys/products");
const mssql_1 = __importDefault(require("mssql"));
const node_fetch_1 = __importDefault(require("node-fetch"));
const getSession_1 = require("../../utils/Redis/getSession");
const getProducts = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    // Get session from REDIS.
    const sessionId = req.sessionID;
    console.log({ sessionId });
    console.log({ SsessionInproduct: req.session });
    const { user: userFR } = yield (0, getSession_1.handleGetWebSession)({ sessionId });
    if (!userFR) {
        return res.status(400).json({ error: 'Sesion terminada' });
    }
    const { Serverweb, Baseweb, Id_ListPre, SwSinStock, SwsinPrecio, SwImagenes, Id_Almacen } = userFR;
    console.log({ Serverweb, Baseweb });
    try {
        const pool = yield (0, database_1.dbConnection)(Serverweb, Baseweb);
        const { nombre, marca, familia, folio, enStock, page, limit } = req.query;
        if (!pool) {
            res.status(500).json({ error: 'No se pudo establecer la conexión con la base de datos' });
            return;
        }
        // Define query parameters for the SQL query
        const params = {
            ListaPrecios: Id_ListPre, // Default ListaPrecios value
            Almacen: Id_Almacen, // User's warehouse
        };
        let query = products_1.productsQuerys.getAllProducts;
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
        if (!SwSinStock) {
            query += ' AND E.Existencia > 0';
        }
        // Dont show products without price
        if (!SwsinPrecio) {
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
        if (SwImagenes) {
            // Ahora, para cada producto, agrega la propiedad "imagen"
            for (const product of products) {
                // Supongamos que la URL de la imagen se basa en la propiedad "Codigo" del producto
                const baseSQL = Baseweb.trim().toLowerCase().split(',');
                if (baseSQL && baseSQL.length > 0) {
                    const formatImageDB = baseSQL[baseSQL.length - 1].split('_');
                    const imageDB = formatImageDB[formatImageDB.length - 1];
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
    finally {
        yield (0, database_1.closeDbConnection)();
    }
});
exports.getProducts = getProducts;
const getProducByIdWeb = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    // Get session from REDIS.
    const sessionId = req.sessionID;
    const { user: userFR } = yield (0, getSession_1.handleGetWebSession)({ sessionId });
    if (!userFR) {
        return res.status(400).json({ error: 'Sesion terminada' });
    }
    const { Serverweb, Baseweb, Id_ListPre, Id_Almacen } = userFR;
    try {
        const { id } = req.params;
        const { Marca } = req.query;
        const pool = yield (0, database_1.dbConnection)(Serverweb, Baseweb);
        if (!pool) {
            return res.status(500).json({ error: 'No se pudo establecer la conexión con la base de datos' });
        }
        const result = yield pool.request()
            .input("Codigo", id)
            .input("Marca", Marca)
            .input("ListaPrecios", Id_ListPre)
            .input("Almacen", Id_Almacen)
            .query(products_1.productsQuerys.getProducById);
        const product = result === null || result === void 0 ? void 0 : result.recordset[0];
        //if (user?.SwImagenes) {
        const baseSQL = Baseweb.trim().toLowerCase().split(',');
        if (baseSQL && baseSQL.length > 0) {
            const formatImageDB = baseSQL[baseSQL.length - 1].split('_');
            const imageDB = formatImageDB[formatImageDB.length - 1];
            // Número máximo de intentos para encontrar la imagen
            const maxAttempts = 5;
            let attempt = 0;
            let images = [];
            while (attempt < maxAttempts) {
                let imageUrl;
                if (attempt === 0) {
                    imageUrl = `https://oleistorage.blob.core.windows.net/${imageDB}/${product === null || product === void 0 ? void 0 : product.Codigo.trim()}.jpg`;
                }
                else {
                    imageUrl = `https://oleistorage.blob.core.windows.net/${imageDB}/${product === null || product === void 0 ? void 0 : product.Codigo.trim()}_${attempt}.jpg`;
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
        return res.json(product);
    }
    catch (error) {
        console.log({ error });
        return res.status(500).json({ error });
    }
    finally {
        yield (0, database_1.closeDbConnection)();
    }
});
exports.getProducByIdWeb = getProducByIdWeb;
const getTotalProducts = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    // Get session from REDIS.
    const sessionId = req.sessionID;
    console.log({ sessionId });
    const { user: userFR } = yield (0, getSession_1.handleGetWebSession)({ sessionId });
    if (!userFR) {
        return res.status(400).json({ error: 'Sesion terminada' });
    }
    const { Serverweb, Baseweb } = userFR;
    try {
        const pool = yield (0, database_1.dbConnection)(Serverweb, Baseweb);
        const result = yield (pool === null || pool === void 0 ? void 0 : pool.request().query(products_1.productsQuerys.getTotalProducts));
        res.json(result === null || result === void 0 ? void 0 : result.recordset[0][""]);
    }
    catch (error) {
        console.log({ error });
        return res.status(500).json({ error });
    }
    finally {
        yield (0, database_1.closeDbConnection)();
    }
});
exports.getTotalProducts = getTotalProducts;
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
//# sourceMappingURL=productsWeb.js.map
"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.getProductByStockAndCodeBar = exports.getTotalOfProductsByStock = exports.getProductsByStock = exports.getProducById = void 0;
const database_1 = require("../../database");
const products_1 = require("../../database/querys/products");
const node_fetch_1 = __importDefault(require("node-fetch"));
const identifyBarcodeType_1 = require("../../utils/identifyBarcodeType");
const getSession_1 = require("../../utils/Redis/getSession");
const getProducById = async (req, res) => {
    const { id } = req.params;
    const { Marca } = req.query;
    const Id_Usuario = req.id;
    const sessionId = req.sessionID;
    const { user: userFR } = await (0, getSession_1.handleGetSession)({ sessionId });
    if (!userFR) {
        return res.status(400).json({ error: 'Sesion terminada' });
    }
    const { serverclientes, baseclientes, PasswordSQL, UsuarioSQL } = userFR;
    try {
        const pool = await (0, database_1.dbConnection)(serverclientes, baseclientes, PasswordSQL, UsuarioSQL);
        const userquery = database_1.querys.getAuthLimitData;
        const requestUser = await pool.request().input('Id_Usuario', Id_Usuario).query(userquery);
        const user = requestUser.recordset[0];
        if (!pool) {
            return res.status(500).json({ error: 'No se pudo establecer la conexión con la base de datos' });
        }
        const result = await pool.request()
            .input("Codigo", id)
            .input("Marca", Marca)
            .input("ListaPrecios", user.Id_ListPre)
            .input("Almacen", user.Id_Almacen)
            .query(products_1.productsQuerys.getProducById);
        const product = result?.recordset[0];
        const baseSQL = baseclientes.trim().toLowerCase().split(',');
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
                    imageUrl = `https://oleistorage.blob.core.windows.net/${imageDB}/${product?.Codigo.trim()}.jpg`;
                }
                else {
                    imageUrl = `https://oleistorage.blob.core.windows.net/${imageDB}/${product?.Codigo.trim()}_${attempt}.jpg`;
                }
                // Verifica si la imagen existe
                const imageExists = await checkImageExists(imageUrl);
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
};
exports.getProducById = getProducById;
/* const getTotalProducts = async (req: Request, res: Response) => {
    const sessionId = req.sessionID;
    const { user: userFR } = await handleGetSession({ sessionId });

    if (!userFR) {
        return res.status(400).json({ error: 'Sesion terminada' });
    }

    const { serverclientes, baseclientes, PasswordSQL, UsuarioSQL} = userFR;
    const pool = await dbConnection(serverclientes, baseclientes, PasswordSQL, UsuarioSQL);
    const result = await pool?.request().query(productsQuerys.getTotalProducts);
    res.json(result?.recordset[0][""]);
}; */
const getProductsByStock = async (req, res) => {
    const { PageNumber, PageSize } = req.query;
    const sessionId = req.sessionID;
    const { user: userFR } = await (0, getSession_1.handleGetSession)({ sessionId });
    if (!userFR) {
        return res.status(400).json({ error: 'Sesion terminada' });
    }
    const { serverclientes, baseclientes, userId, PasswordSQL, UsuarioSQL } = userFR;
    try {
        const pool = await (0, database_1.dbConnection)(serverclientes, baseclientes, PasswordSQL, UsuarioSQL);
        const userquery = database_1.querys.getAuthLimitData;
        const requestUser = await pool.request().input('Id_Usuario', userId).query(userquery);
        const user = requestUser.recordset[0];
        if (!pool) {
            res.status(500).json({ error: 'No se pudo establecer la conexión con la base de datos' });
        }
        let query = products_1.productsQuerys.getAllProductsByStock;
        const request = await pool.request()
            .input('PageSize', Number(PageSize))
            .input('PageNumber', PageNumber)
            .input('Id_ListaPrecios', user.Id_ListPre)
            .input('Almacen', user.Id_Almacen)
            .query(query);
        const productsByStock = request.recordset;
        const { products } = await getImagesFromProducts({
            base: baseclientes,
            products: productsByStock
        });
        res.json(products);
    }
    catch (error) {
        console.log({ error });
        res.status(500).json({ error: error.message });
    }
};
exports.getProductsByStock = getProductsByStock;
const getTotalOfProductsByStock = async (req, res) => {
    const Id_Usuario = req.id;
    const sessionId = req.sessionID;
    const { user: userFR } = await (0, getSession_1.handleGetSession)({ sessionId });
    if (!userFR) {
        return res.status(400).json({ error: 'Sesion terminada' });
    }
    const { serverclientes, baseclientes, PasswordSQL, UsuarioSQL } = userFR;
    try {
        const pool = await (0, database_1.dbConnection)(serverclientes, baseclientes, PasswordSQL, UsuarioSQL);
        const userquery = database_1.querys.getAuthLimitData;
        const requestUser = await pool.request().input('Id_Usuario', Id_Usuario).query(userquery);
        const user = requestUser.recordset[0];
        if (!pool) {
            res.status(500).json({ error: 'No se pudo establecer la conexión con la base de datos' });
        }
        let query = products_1.productsQuerys.getTotalOfAllProductsByStock;
        const request = await pool.request()
            .input('Id_ListaPrecios', user.Id_ListPre)
            .input('Almacen', user.Id_Almacen)
            .query(query);
        const TotalProductos = request.recordset;
        res.json(TotalProductos);
    }
    catch (error) {
        console.log({ error });
        res.status(500).json({ error: error.message });
    }
};
exports.getTotalOfProductsByStock = getTotalOfProductsByStock;
const getProductByStockAndCodeBar = async (req, res) => {
    const { CodBar, Codigo } = req.query;
    const sessionId = req.sessionID;
    const { user: userFR } = await (0, getSession_1.handleGetSession)({ sessionId });
    if (!userFR) {
        return res.status(400).json({ error: 'Sesion terminada' });
    }
    const { serverclientes, baseclientes, userId, PasswordSQL, UsuarioSQL } = userFR;
    try {
        const pool = await (0, database_1.dbConnection)(serverclientes, baseclientes, PasswordSQL, UsuarioSQL);
        const userquery = database_1.querys.getAuthLimitData;
        const requestUser = await pool.request().input('Id_Usuario', userId).query(userquery);
        const user = requestUser.recordset[0];
        if (!pool) {
            return res.status(500).json({ error: 'No se pudo establecer la conexión con la base de datos' });
        }
        let isEAN13orUPC14 = false;
        if (CodBar) {
            isEAN13orUPC14 = (0, identifyBarcodeType_1.guessBarcodeType)(CodBar);
        }
        let request;
        if (isEAN13orUPC14) {
            let query = products_1.productsQuerys.getProductByStockAndCodeBarDV;
            request = await pool.request()
                .input("CodBar", CodBar === 'undefined' ? null : CodBar)
                .input('Id_ListaPrecios', user.Id_ListPre)
                .input('Id_Almacen', user.Id_Almacen)
                .query(query);
        }
        else {
            let query = products_1.productsQuerys.getProductByStockAndCodeBar;
            request = await pool.request()
                .input("CodBar", CodBar === 'undefined' ? null : CodBar)
                .input("Codigo", Codigo === 'undefined' ? null : Codigo)
                .input('Id_ListaPrecios', user.Id_ListPre)
                .input('Id_Almacen', user.Id_Almacen)
                .query(query);
        }
        const productByStockAndCodeBar = request.recordset;
        res.json(productByStockAndCodeBar);
    }
    catch (error) {
        console.log({ error });
        return res.status(500).json({ error: 'Ocurrió un error al procesar la solicitud / getProductByStockAndCodeBar' });
    }
};
exports.getProductByStockAndCodeBar = getProductByStockAndCodeBar;
// Utils
const checkImageExists = async (url) => {
    try {
        const response = await (0, node_fetch_1.default)(url, { method: 'HEAD' });
        return response.ok;
    }
    catch (error) {
        console.error('Error during image check:', error);
        return false;
    }
};
const getImagesFromProducts = async ({ base, products }) => {
    // Ahora, para cada producto, agrega la propiedad "imagen"
    for (const product of products) {
        // Supongamos que la URL de la imagen se basa en la propiedad "Codigo" del producto
        const baseSQL = base?.trim().toLowerCase().split(',');
        if (baseSQL && baseSQL.length > 0) {
            const formatImageDB = baseSQL[baseSQL.length - 1].split('_');
            const imageDB = formatImageDB[formatImageDB.length - 1];
            const imageUrl = `https://oleistorage.blob.core.windows.net/${imageDB}/${product.Codigo.trim()}.jpg`;
            // Verifica si la imagen existe antes de agregarla al producto
            const imageExists = await checkImageExists(imageUrl);
            if (imageExists) {
                product.imagen = [{
                        url: imageUrl,
                        id: 1
                    }];
            }
        }
    }
    return { products };
};
//# sourceMappingURL=products.js.map
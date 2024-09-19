"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.getTotalProducts = exports.getProducByIdWeb = exports.getProducts = void 0;
const database_1 = require("../../database");
const mssql_1 = __importDefault(require("mssql"));
const getSession_1 = require("../../utils/Redis/getSession");
const productsWeb_1 = require("../../database/querys/productsWeb");
const checkImageExists_1 = require("../../utils/checkImageExists");
const getProducts = async (req, res) => {
    const sessionId = req.sessionRedis;
    const { user: userFR } = await (0, getSession_1.handleGetWebSession)({ sessionId });
    if (!userFR) {
        return res.status(401).json({ error: 'Sesion terminada' });
    }
    const { Serverweb, Baseweb, Id_ListPre, SwSinStock, SwsinPrecio, SwImagenes, Id_Almacen } = userFR;
    try {
        const pool = await (0, database_1.dbConnection)(Serverweb, Baseweb);
        if (!pool) {
            res.status(500).json({ error: 'No se pudo establecer la conexión con la base de datos' });
            return;
        }
        const { nombre, marca, familia, folio, page = '1', limit = '10' } = req.query;
        const pageNumber = parseInt(page, 10) || 1;
        const limitNumber = parseInt(limit, 10) || 10;
        let query = productsWeb_1.productsWebQuerys.getAllProducts;
        const result = await pool.request()
            .input('nombre', mssql_1.default.VarChar, nombre || '')
            .input('marca', mssql_1.default.VarChar, marca || '')
            .input('familia', mssql_1.default.VarChar, familia || '')
            .input('codigo', mssql_1.default.VarChar, folio || '')
            .input('SwSinStock', mssql_1.default.Bit, SwSinStock === true ? 1 : 0)
            .input('SwsinPrecio', mssql_1.default.Bit, SwsinPrecio === true ? 1 : 0)
            .input('SwImagenes', mssql_1.default.Bit, SwImagenes === true ? 1 : 0)
            .input('Id_ListPre', mssql_1.default.Int, Id_ListPre)
            .input('Id_Almacen', mssql_1.default.Int, Id_Almacen)
            .input('page', mssql_1.default.Int, pageNumber)
            .input('limit', mssql_1.default.Int, limitNumber)
            .input('baseSQL', mssql_1.default.VarChar, Baseweb || '')
            .query(query);
        const products = result.recordset;
        const productsWithImages = await (0, checkImageExists_1.getProductsWithImage)(products);
        res.json({
            total: productsWithImages.length,
            products: productsWithImages
        });
    }
    catch (error) {
        console.log({ errorGP: error });
        res.status(500).json({ error: error.message });
    }
};
exports.getProducts = getProducts;
const getProducByIdWeb = async (req, res) => {
    // Get session from REDIS.
    const sessionId = req.sessionRedis;
    const { user: userFR } = await (0, getSession_1.handleGetWebSession)({ sessionId });
    if (!userFR) {
        return res.status(401).json({ error: 'Sesion terminada' });
    }
    const { Serverweb, Baseweb, Id_ListPre, Id_Almacen } = userFR;
    try {
        const { id } = req.params;
        const { Marca } = req.query;
        const pool = await (0, database_1.dbConnection)(Serverweb, Baseweb);
        if (!pool) {
            return res.status(500).json({ error: 'No se pudo establecer la conexión con la base de datos' });
        }
        const result = await pool.request()
            .input("Codigo", id)
            .input("Marca", Marca)
            .input("ListaPrecios", Id_ListPre)
            .input("Almacen", Id_Almacen)
            .input('baseSQL', mssql_1.default.VarChar, Baseweb || '')
            .query(productsWeb_1.productsWebQuerys.getProducById);
        const productBefore = result?.recordset[0];
        const product = await (0, checkImageExists_1.getProductWithImages)({
            baseSQL: Baseweb,
            Codigo: productBefore.Codigo,
            product: productBefore
        });
        return res.json(product);
    }
    catch (error) {
        console.log({ error });
        return res.status(500).json({ error });
    }
};
exports.getProducByIdWeb = getProducByIdWeb;
const getTotalProducts = async (req, res) => {
    // Get session from REDIS.
    const sessionId = req.sessionRedis;
    const { user: userFR } = await (0, getSession_1.handleGetWebSession)({ sessionId });
    if (!userFR) {
        return res.status(401).json({ error: 'Sesion terminada' });
    }
    const { Serverweb, Baseweb, Id_ListPre, SwSinStock, SwsinPrecio, SwImagenes, Id_Almacen } = userFR;
    try {
        const pool = await (0, database_1.dbConnection)(Serverweb, Baseweb);
        if (!pool) {
            res.status(500).json({ error: 'No se pudo establecer la conexión con la base de datos' });
            return;
        }
        const { nombre, marca, familia, folio } = req.query;
        const result = await pool?.request()
            .input('nombre', mssql_1.default.VarChar, nombre || '')
            .input('marca', mssql_1.default.VarChar, marca || '')
            .input('familia', mssql_1.default.VarChar, familia || '')
            .input('codigo', mssql_1.default.VarChar, folio || '')
            .input('SwSinStock', mssql_1.default.Bit, SwSinStock === true ? 1 : 0)
            .input('SwsinPrecio', mssql_1.default.Bit, SwsinPrecio === true ? 1 : 0)
            .input('SwImagenes', mssql_1.default.Bit, SwImagenes === true ? 1 : 0)
            .input('Id_ListPre', mssql_1.default.Int, Id_ListPre)
            .input('Id_Almacen', mssql_1.default.Int, Id_Almacen)
            .query(productsWeb_1.productsWebQuerys.getTotalProducts);
        res.json({ total: result?.recordset[0][""] });
    }
    catch (error) {
        console.log({ errorTP: error });
        return res.status(500).json({ error });
    }
};
exports.getTotalProducts = getTotalProducts;
//# sourceMappingURL=productsWeb.js.map
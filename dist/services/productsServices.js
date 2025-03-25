"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.getProductByStockAndCodeBarService = exports.searchProductByStockService = exports.getProductsByStockService = exports.getTotalProductsService = exports.getProducByIdWebService = exports.getProductsService = exports.searchProductService = void 0;
const mssql_1 = __importDefault(require("mssql"));
const database_1 = require("../database");
const productsWeb_1 = require("../database/querys/productsWeb");
const products_1 = require("../database/querys/products");
const checkImageExists_1 = require("../utils/checkImageExists");
const CustomError_1 = require("../errors/CustomError");
const identifyBarcodeType_1 = require("../utils/identifyBarcodeType");
const getProductsService = async ({ userSession, page, limit, nombre, marca, familia, folio }) => {
    const { ServidorSQL, BaseSQL, Id_ListPre, SwSinStock, SwsinPrecio, SwImagenes, Id_Almacen } = userSession;
    const pool = await (0, database_1.dbConnectionWeb)(ServidorSQL, BaseSQL);
    if (!pool) {
        throw new CustomError_1.ValidationError('Error al conectarse a base de datos principal');
    }
    let query = productsWeb_1.productsWebQuerys.getAllProducts;
    const result = await pool.request()
        .input('nombre', mssql_1.default.VarChar, nombre)
        .input('marca', mssql_1.default.VarChar, marca)
        .input('familia', mssql_1.default.VarChar, familia)
        .input('codigo', mssql_1.default.VarChar, folio)
        .input('SwSinStock', mssql_1.default.Bit, SwSinStock === true ? 1 : 0)
        .input('SwsinPrecio', mssql_1.default.Bit, SwsinPrecio === true ? 1 : 0)
        .input('SwImagenes', mssql_1.default.Bit, SwImagenes === true ? 1 : 0)
        .input('Id_ListPre', mssql_1.default.Int, Id_ListPre)
        .input('Id_Almacen', mssql_1.default.Int, Id_Almacen)
        .input('page', mssql_1.default.Int, page)
        .input('limit', mssql_1.default.Int, limit)
        .input('baseSQL', mssql_1.default.VarChar, BaseSQL ?? '')
        .query(query);
    const products = result.recordset;
    const productsWithImages = await (0, checkImageExists_1.getProductsWithImage)(products);
    return {
        products: productsWithImages
    };
};
exports.getProductsService = getProductsService;
;
const getProducByIdWebService = async ({ userSession, codigo, Marca }) => {
    const { ServidorSQL, BaseSQL, Id_ListPre, Id_Almacen } = userSession;
    const pool = await (0, database_1.dbConnectionWeb)(ServidorSQL, BaseSQL);
    if (!pool) {
        throw new CustomError_1.ValidationError('Error al conectarse a base de datos principal');
    }
    const result = await pool.request()
        .input("Codigo", codigo)
        .input("Marca", Marca)
        .input("ListaPrecios", Id_ListPre)
        .input("Almacen", Id_Almacen)
        .input('baseSQL', mssql_1.default.VarChar, BaseSQL || '')
        .query(productsWeb_1.productsWebQuerys.getProducById);
    const productBefore = result?.recordset[0];
    const product = await (0, checkImageExists_1.getProductWithImages)({
        baseSQL: BaseSQL,
        Codigo: productBefore.Codigo,
        product: productBefore
    });
    return {
        product
    };
};
exports.getProducByIdWebService = getProducByIdWebService;
const getTotalProductsService = async ({ userSession, nombre, marca, familia, folio }) => {
    const { ServidorSQL, BaseSQL, Id_ListPre, SwSinStock, SwsinPrecio, SwImagenes, Id_Almacen } = userSession;
    const pool = await (0, database_1.dbConnectionWeb)(ServidorSQL, BaseSQL);
    if (!pool) {
        throw new CustomError_1.ValidationError('Error al conectarse a base de datos principal');
    }
    const result = await pool.request()
        .input('nombre', mssql_1.default.VarChar, nombre)
        .input('marca', mssql_1.default.VarChar, marca)
        .input('familia', mssql_1.default.VarChar, familia)
        .input('codigo', mssql_1.default.VarChar, folio)
        .input('SwSinStock', mssql_1.default.Bit, SwSinStock === true ? 1 : 0)
        .input('SwsinPrecio', mssql_1.default.Bit, SwsinPrecio === true ? 1 : 0)
        .input('SwImagenes', mssql_1.default.Bit, SwImagenes === true ? 1 : 0)
        .input('Id_ListPre', mssql_1.default.Int, Id_ListPre)
        .input('Id_Almacen', mssql_1.default.Int, Id_Almacen)
        .query(productsWeb_1.productsWebQuerys.getTotalProducts);
    const total = result?.recordset[0].TotalCount;
    return {
        total
    };
};
exports.getTotalProductsService = getTotalProductsService;
const searchProductService = async ({ userSession, nombre, marca, familia, codigo }) => {
    const { ServidorSQL, BaseSQL, Id_ListPre, SwSinStock, SwsinPrecio, Id_Almacen } = userSession;
    const pool = await (0, database_1.dbConnectionWeb)(ServidorSQL, BaseSQL);
    if (!pool) {
        throw new CustomError_1.ValidationError('Error al conectarse a base de datos principal');
    }
    // Execute the SQL query
    const result = await pool.request()
        .input('Descripcion', mssql_1.default.VarChar, nombre)
        .input('Id_ListaPrecios', mssql_1.default.Int, Id_ListPre)
        .input('Id_Almacen', mssql_1.default.Int, Id_Almacen)
        .input('Codigo', mssql_1.default.VarChar, codigo || "")
        .input('familia', mssql_1.default.VarChar, familia || "")
        .input('marca', mssql_1.default.VarChar, marca || "")
        .input('SwSinStock', mssql_1.default.Bit, SwSinStock === true ? 1 : 0)
        .input('SwsinPrecio', mssql_1.default.Bit, SwsinPrecio === true ? 1 : 0)
        .query(productsWeb_1.productsWebQuerys.getProductsBySearch);
    const products = result.recordset.map(row => row.Descripcion);
    return {
        products
    };
};
exports.searchProductService = searchProductService;
;
const getProductsByStockService = async ({ userSession, PageSize, PageNumber, getTotal = false }) => {
    const { ServidorSQL, BaseSQL, PasswordSQL, UsuarioSQL, Id_Almacen, Id_ListPre } = userSession;
    const pool = await (0, database_1.dbConnection)(ServidorSQL, BaseSQL, UsuarioSQL, PasswordSQL);
    if (!pool) {
        throw new CustomError_1.ValidationError('Error al conectarse a base de datos principal');
    }
    let query;
    if (!getTotal) {
        query = products_1.productsQuerys.getAllProductsByStock;
    }
    else {
        query = products_1.productsQuerys.getTotalOfAllProductsByStock;
    }
    ;
    if (!Id_Almacen) {
        throw new CustomError_1.ValidationError("Id Almacen necesario");
    }
    ;
    if (!Id_ListPre) {
        throw new CustomError_1.ValidationError("Id_ListPre necesario");
    }
    const request = await pool.request()
        .input('PageSize', PageSize)
        .input('PageNumber', PageNumber)
        .input('Id_ListaPrecios', Id_ListPre)
        .input('Almacen', Id_Almacen)
        .query(query);
    const productsByStock = request.recordset;
    return {
        products: productsByStock
    };
};
exports.getProductsByStockService = getProductsByStockService;
const getProductByStockAndCodeBarService = async ({ userSession, CodBar, SKU, Codigo }) => {
    const { ServidorSQL, BaseSQL, PasswordSQL, UsuarioSQL, Id_Almacen, Id_ListPre } = userSession;
    const pool = await (0, database_1.dbConnection)(ServidorSQL, BaseSQL, UsuarioSQL, PasswordSQL);
    let isEAN13orUPC14 = false;
    if (CodBar) {
        isEAN13orUPC14 = (0, identifyBarcodeType_1.guessBarcodeType)(CodBar);
    }
    let request;
    // This is an excepcion for codebar
    if (isEAN13orUPC14) {
        let query = products_1.productsQuerys.getProductByStockAndCodeBarDV;
        request = await pool.request()
            .input("CodBar", CodBar === 'undefined' ? null : CodBar)
            .input('Id_ListaPrecios', Id_ListPre)
            .input('Id_Almacen', Id_Almacen)
            .input('SKU', SKU)
            .query(query);
    }
    else {
        let query = products_1.productsQuerys.getProductByStockAndCodeBar;
        request = await pool.request()
            .input("CodBar", CodBar === 'undefined' ? null : CodBar)
            .input("Codigo", Codigo === 'undefined' ? null : Codigo)
            .input('Id_ListaPrecios', Id_ListPre)
            .input('Id_Almacen', Id_Almacen)
            .input('SKU', SKU)
            .query(query);
    }
    ;
    const productByStockAndCodeBar = request.recordset;
    return { productByStockAndCodeBar };
};
exports.getProductByStockAndCodeBarService = getProductByStockAndCodeBarService;
const searchProductByStockService = async ({ userSession, searchTerm, withCodebar }) => {
    const { ServidorSQL, BaseSQL, userId, PasswordSQL, UsuarioSQL, Id_Almacen, Id_ListPre } = userSession;
    const pool = await (0, database_1.dbConnection)(ServidorSQL, BaseSQL, UsuarioSQL, PasswordSQL);
    if (!pool) {
        throw new CustomError_1.ValidationError('Error al conectarse a base de datos principal');
    }
    let query;
    if (withCodebar) {
        query = products_1.productsQuerys.getProductsBySearchInventory;
    }
    else {
        query = products_1.productsQuerys.getProductsBySearchInventoryWithoutCodebar;
    }
    ;
    const result = await pool.request()
        .input("searchTerm", searchTerm)
        .input('Id_Usuario', userId)
        .input('Id_Almacen', Id_Almacen)
        .input('Id_ListPre', Id_ListPre)
        .query(query);
    const products = result.recordset;
    return {
        products
    };
};
exports.searchProductByStockService = searchProductByStockService;
//# sourceMappingURL=productsServices.js.map
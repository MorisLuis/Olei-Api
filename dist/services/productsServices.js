"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.getProductsByStockService = exports.getTotalProductsService = exports.getProducByIdWebService = exports.getProductsService = exports.searchProductService = void 0;
const database_1 = require("../database");
const productsWeb_1 = require("../database/querys/productsWeb");
const getSession_1 = require("../utils/Redis/getSession");
const mssql_1 = __importDefault(require("mssql"));
const checkImageExists_1 = require("../utils/checkImageExists");
const products_1 = require("../database/querys/products");
const CustomError_1 = require("../errors/CustomError");
const getProductsService = async ({ sessionId, page, limit, nombre, marca, familia, folio }) => {
    const { user: userFR } = await (0, getSession_1.handleGetWebSession)({ sessionId });
    if (!userFR) {
        throw new CustomError_1.UnauthorizedError('Sesion terminada');
    }
    const { Serverweb, Baseweb, Id_ListPre, SwSinStock, SwsinPrecio, SwImagenes, Id_Almacen } = userFR;
    const pool = await (0, database_1.dbConnection)(Serverweb, Baseweb);
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
        .input('baseSQL', mssql_1.default.VarChar, Baseweb ?? '')
        .query(query);
    const products = result.recordset;
    return {
        products
    };
};
exports.getProductsService = getProductsService;
;
const getProducByIdWebService = async ({ sessionId, codigo, Marca }) => {
    const { user: userFR } = await (0, getSession_1.handleGetWebSession)({ sessionId });
    if (!userFR) {
        throw new CustomError_1.UnauthorizedError('Sesion terminada');
    }
    const { Serverweb, Baseweb, Id_ListPre, Id_Almacen } = userFR;
    const pool = await (0, database_1.dbConnection)(Serverweb, Baseweb);
    if (!pool) {
        throw new CustomError_1.ValidationError('Error al conectarse a base de datos principal');
    }
    const result = await pool.request()
        .input("Codigo", codigo)
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
    return {
        product
    };
};
exports.getProducByIdWebService = getProducByIdWebService;
const getTotalProductsService = async ({ sessionId, nombre, marca, familia, folio }) => {
    const { user: userFR } = await (0, getSession_1.handleGetWebSession)({ sessionId });
    if (!userFR) {
        throw new CustomError_1.UnauthorizedError('Sesion terminada');
    }
    const { Serverweb, Baseweb, Id_ListPre, SwSinStock, SwsinPrecio, SwImagenes, Id_Almacen } = userFR;
    const pool = await (0, database_1.dbConnection)(Serverweb, Baseweb);
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
const searchProductService = async ({ sessionId, nombre, marca, familia, codigo }) => {
    const { user: userFR } = await (0, getSession_1.handleGetWebSession)({ sessionId });
    if (!userFR) {
        throw new CustomError_1.UnauthorizedError('Sesion terminada');
    }
    ;
    const { Serverweb, Baseweb, Id_ListPre, SwSinStock, SwsinPrecio, Id_Almacen } = userFR;
    const pool = await (0, database_1.dbConnection)(Serverweb, Baseweb);
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
const getProductsByStockService = async ({ sessionId, PageSize, PageNumber }) => {
    const { user: userFR } = await (0, getSession_1.handleGetSession)({ sessionId });
    if (!userFR) {
        throw new CustomError_1.UnauthorizedError('Sesion terminada');
    }
    const { ServidorSQL, BaseSQL, userId, PasswordSQL, UsuarioSQL, Id_Almacen } = userFR;
    const pool = await (0, database_1.dbConnection)(ServidorSQL, BaseSQL, UsuarioSQL, PasswordSQL);
    const userquery = database_1.querys.getAuthLimitData;
    const requestUser = await pool.request().input('Id_Usuario', userId).query(userquery);
    const user = requestUser.recordset[0];
    if (!pool) {
        throw new CustomError_1.ValidationError('Error al conectarse a base de datos principal');
    }
    let query = products_1.productsQuerys.getAllProductsByStock;
    const request = await pool.request()
        .input('PageSize', PageSize)
        .input('PageNumber', PageNumber)
        .input('Id_ListaPrecios', user.Id_ListPre)
        .input('Almacen', Id_Almacen)
        .query(query);
    const productsByStock = request.recordset;
    return {
        products: productsByStock
    };
};
exports.getProductsByStockService = getProductsByStockService;
//# sourceMappingURL=productsServices.js.map
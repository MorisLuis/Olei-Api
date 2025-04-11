"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.errorTest = exports.searchProductInventoryWithoutCodebar = exports.searchProductInventory = exports.getProductByStockAndCodeBar = exports.getTotalOfProductsByStock = exports.getProductsByStock = exports.getProducById = void 0;
const database_1 = require("../../database");
const productsWeb_1 = require("../../database/querys/productsWeb");
const productsValidations_1 = require("../../validations/productsValidations");
const productsServices_1 = require("../../services/productsServices");
const CustomError_1 = require("../../errors/CustomError");
const inventoryValidations_1 = require("../../validations/inventoryValidations");
const getProducById = async (req, res, next) => {
    try {
        const { id } = req.params;
        const { Marca } = req.query;
        const userSession = req.session;
        const { ServidorSQL, BaseSQL, PasswordSQL, UsuarioSQL, Id_Almacen, Id_ListPre } = userSession;
        const pool = await (0, database_1.dbConnection)(ServidorSQL, BaseSQL, UsuarioSQL, PasswordSQL);
        if (!pool) {
            throw new CustomError_1.ValidationError('Error al conectarse a base de datos principal');
        }
        let query = productsWeb_1.productsWebQuerys.getProducById;
        if (userSession.BaseSQL === 'OLEIDB1_ROSCO' ||
            userSession.BaseSQL === 'OLEIDB1_ROSCO_TEST') {
            // We have to modify query to ROSCO
            query = productsWeb_1.productsWebQuerys.getProducByIdROSCO;
        }
        ;
        const result = await pool.request()
            .input("Codigo", id)
            .input("Marca", Marca)
            .input("ListaPrecios", Id_ListPre)
            .input("Almacen", Id_Almacen)
            .input("baseSQL", BaseSQL)
            .query(query);
        const product = result?.recordset[0];
        return res.json({
            product
        });
    }
    catch (error) {
        next(error);
    }
};
exports.getProducById = getProducById;
const getProductsByStock = async (req, res, next) => {
    try {
        const { PageNumber, PageSize } = productsValidations_1.getProductsByStockQuerySchema.parse(req.query);
        const userSession = req.session;
        if (!userSession) {
            throw new CustomError_1.UnauthorizedError('Sesion terminada');
        }
        const { products } = await (0, productsServices_1.getProductsByStockService)({
            userSession,
            PageNumber,
            PageSize
        });
        res.json({ products });
    }
    catch (error) {
        next(error);
    }
};
exports.getProductsByStock = getProductsByStock;
const getTotalOfProductsByStock = async (req, res, next) => {
    try {
        const userSession = req.session;
        const { products: total } = await (0, productsServices_1.getProductsByStockService)({
            userSession,
            getTotal: true
        });
        res.json({ total: total });
    }
    catch (error) {
        next(error);
    }
};
exports.getTotalOfProductsByStock = getTotalOfProductsByStock;
const getProductByStockAndCodeBar = async (req, res, next) => {
    try {
        const { CodBar, Codigo, SKU } = productsValidations_1.getProductByStockAndCodeBarSchema.parse(req.query);
        const userSession = req.session;
        const { productByStockAndCodeBar } = await (0, productsServices_1.getProductByStockAndCodeBarService)({
            CodBar,
            Codigo,
            SKU,
            userSession
        });
        res.json({ products: productByStockAndCodeBar });
    }
    catch (error) {
        next(error);
    }
};
exports.getProductByStockAndCodeBar = getProductByStockAndCodeBar;
const searchProductInventory = async (req, res, next) => {
    try {
        const { searchTerm } = inventoryValidations_1.searchProductInventoryQuerySchema.parse(req.query);
        const userSession = req.session;
        const { products } = await (0, productsServices_1.searchProductByStockService)({
            userSession,
            searchTerm: searchTerm,
            withCodebar: true
        });
        return res.json({ products });
    }
    catch (error) {
        return next(error);
    }
};
exports.searchProductInventory = searchProductInventory;
const searchProductInventoryWithoutCodebar = async (req, res, next) => {
    try {
        const { searchTerm } = inventoryValidations_1.searchProductInventoryQuerySchema.parse(req.query);
        const userSession = req.session;
        const { products } = await (0, productsServices_1.searchProductByStockService)({
            userSession,
            searchTerm: searchTerm,
            withCodebar: false
        });
        return res.json({ products });
    }
    catch (error) {
        return next(error);
    }
};
exports.searchProductInventoryWithoutCodebar = searchProductInventoryWithoutCodebar;
const errorTest = (_req, _res, next) => {
    try {
        // Se genera un error intencional para probar el manejo de errores
        const error = new Error('Error intencional del servidor');
        error.status = 500;
        // Se pasa al siguiente middleware de manejo de errores
        next(error);
    }
    catch (err) {
        next(err);
    }
};
exports.errorTest = errorTest;
//# sourceMappingURL=products.js.map
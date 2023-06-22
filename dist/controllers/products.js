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
    try {
        const pool = yield (0, database_1.dbConnection)();
        const getAllProducts = `
        SELECT TOP(100) P.*, F.*, PR.*, E.*
        FROM [OLEIDB1].[dbo].[PRODUCTOS] P
        JOIN [OLEIDB1].[dbo].[FAMILIAS] F ON P.Id_Familia = F.Id_Familia
        JOIN [OLEIDB1].[dbo].[PRECIOS] PR ON P.Codigo = PR.Codigo
        JOIN [OLEIDB1].[dbo].[EXISTENCIAS] E ON P.Codigo = E.Codigo
        `;
        const result = yield (pool === null || pool === void 0 ? void 0 : pool.request().query(getAllProducts));
        console.log({ result: result === null || result === void 0 ? void 0 : result.recordset });
        res.json({
            products: result === null || result === void 0 ? void 0 : result.recordset
        });
    }
    catch (error) {
        res.status(500);
        res.send(error.message);
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
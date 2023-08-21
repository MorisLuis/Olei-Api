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
exports.searchProduct = void 0;
const database_1 = require("../database");
const searchProduct = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { term } = req.body;
    console.log({ term });
    try {
        const pool = yield (0, database_1.dbConnection)();
        let query;
        if (!pool) {
            res.status(500).json({ error: 'No se pudo establecer la conexión con la base de datos' });
            return;
        }
        if (term) {
            query = `${database_1.querys.getProductsBySearch} WHERE LOWER(P.Descripcion) LIKE '%' + LOWER('${term}') + '%'`;
        }
        else {
            query = database_1.querys.getProductsBySearch;
        }
        const result = yield pool.request().query(query);
        const total = result.recordset.length;
        res.json({
            total,
            products: result.recordset,
        });
    }
    catch (error) {
        res.status(500).json({ error: error.message });
    }
});
exports.searchProduct = searchProduct;
//# sourceMappingURL=search.js.map
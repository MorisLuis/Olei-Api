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
exports.getProductsStatistics = exports.getBriefProductsStatistics = void 0;
const database_1 = require("../database");
const statistics_1 = require("../database/querys/statistics");
const getBriefProductsStatistics = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const pool = yield (0, database_1.dbConnection)();
    if (!pool) {
        return res.status(500).json({ error: 'No se pudo establecer la conexión con la base de datos' });
    }
    try {
        const query = statistics_1.statisticsQuery.getProductsStatistics;
        const request = yield pool.request()
            .query(query);
        const result = request.recordsets[0];
        res.json(result);
    }
    catch (error) {
        res.status(500);
        res.send(error.message);
    }
});
exports.getBriefProductsStatistics = getBriefProductsStatistics;
const getProductsStatistics = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const pool = yield (0, database_1.dbConnection)();
    if (!pool) {
        return res.status(500).json({ error: 'No se pudo establecer la conexión con la base de datos' });
    }
    const { PageNumber, PageSize, path } = req.query;
    const pathString = path;
    try {
        const queryFunctions = {
            WithoutStock: statistics_1.statisticsQuery.getProductsWithoutStock,
            AlmostWithoutStock: statistics_1.statisticsQuery.getProductsAlmostWithoutStock,
            WithLessThan5: statistics_1.statisticsQuery.getProductsWithLessThan5,
            Between5And16: statistics_1.statisticsQuery.getProductsBetween5And16,
            MoreThan16: statistics_1.statisticsQuery.getProductsWithMoreThan16,
        };
        const query = queryFunctions[pathString];
        if (!query) {
            return res.status(400).json({ error: 'Invalid path' });
        }
        const request = yield pool.request()
            .input('PageSize', Number(PageSize))
            .input('PageNumber', PageNumber)
            .query(query);
        const result = request.recordsets[0];
        return res.json(result);
    }
    catch (error) {
        res.status(500).send(error.message);
    }
});
exports.getProductsStatistics = getProductsStatistics;
//# sourceMappingURL=statistics.js.map
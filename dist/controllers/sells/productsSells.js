"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getSellsProductsCountAndTotal = exports.getSellsProducts = void 0;
const sellsProductsValidations_1 = require("../../validations/sellsProductsValidations");
const sellsProducts_1 = require("../../services/sellsProducts/sellsProducts");
const getSellsProducts = async (req, res, next) => {
    try {
        const { Marca, PageNumber, DateEnd, DateExactly, DateStart, Descripcion, OrderCondition, Sku, Codigo } = sellsProductsValidations_1.getSellsProductsQuerySchema.parse(req.query);
        const userSession = req.sessionWeb;
        const { sells } = await (0, sellsProducts_1.getSellsProductsService)({
            userSession,
            PageNumber,
            Marca: Marca || null,
            DateEnd: DateEnd || null,
            DateExactly: DateExactly || null,
            DateStart: DateStart || null,
            Descripcion: Descripcion || null,
            Codigo: Codigo || null,
            Sku: Sku || null,
            OrderCondition
        });
        return res.json({
            sells
        });
    }
    catch (error) {
        return next(error);
    }
    ;
};
exports.getSellsProducts = getSellsProducts;
const getSellsProductsCountAndTotal = async (req, res, next) => {
    try {
        const { Marca, DateEnd, DateExactly, DateStart, Descripcion, Sku, Codigo } = sellsProductsValidations_1.getSellsProductsCountAndTotalQuerySchema.parse(req.query);
        const userSession = req.sessionWeb;
        const { count, totals } = await (0, sellsProducts_1.getSellsProductsCountAndTotalService)({
            userSession,
            Marca: Marca || null,
            DateEnd: DateEnd || null,
            DateExactly: DateExactly || null,
            DateStart: DateStart || null,
            Descripcion: Descripcion || null,
            Codigo: Codigo || null,
            Sku,
        });
        return res.json({
            count,
            totals
        });
    }
    catch (error) {
        return next(error);
    }
    ;
};
exports.getSellsProductsCountAndTotal = getSellsProductsCountAndTotal;
//# sourceMappingURL=productsSells.js.map
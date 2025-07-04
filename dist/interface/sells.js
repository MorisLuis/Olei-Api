"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.SellsProductsOrderCondition = exports.CobranzaOrderCondition = exports.SellsFilterCondition = exports.SellsOrderByClientCondition = exports.SellsOrderCondition = exports.TipoDoc = void 0;
exports.TipoDoc = [0, 1, 2, 3, 4];
exports.SellsOrderCondition = ['Nombre', 'Total'];
exports.SellsOrderByClientCondition = ['TipoDoc', 'Folio', 'Fecha', 'FechaEntrega', 'ExpiredDays'];
exports.SellsFilterCondition = ['TipoDoc', 'Expired', "Not Expired"];
exports.CobranzaOrderCondition = ['Nombre', 'ExpiredDays', 'SaldoVencido', 'SaldoNoVencido', 'TotalSaldo'];
exports.SellsProductsOrderCondition = ['Folio', 'Codigo', 'Fecha', 'Marca', 'Descripcion'];
//# sourceMappingURL=sells.js.map
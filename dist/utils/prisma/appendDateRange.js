"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.appendDateFilter = void 0;
const dayjs_1 = __importDefault(require("dayjs"));
function appendDateFilter(where, field, startDate, endDate, exactlyDate) {
    if (!startDate && !endDate && !exactlyDate)
        return;
    const dateFilter = { [field]: {} };
    if (exactlyDate) {
        const start = (0, dayjs_1.default)(exactlyDate).startOf('day').toDate();
        const end = (0, dayjs_1.default)(exactlyDate).endOf('day').toDate();
        dateFilter[field].gte = start;
        dateFilter[field].lte = end;
    }
    else {
        if (startDate)
            dateFilter[field].gte = (0, dayjs_1.default)(startDate).startOf('day').toDate();
        if (endDate)
            dateFilter[field].lte = (0, dayjs_1.default)(endDate).endOf('day').toDate();
    }
    where.AND = [...(where.AND || []), dateFilter];
}
exports.appendDateFilter = appendDateFilter;
//# sourceMappingURL=appendDateRange.js.map
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getAllCobranzaService = void 0;
const cobranzaService_1 = require("./cobranzaService");
const getAllCobranzaService = async (params) => {
    let allSells = [];
    let pageNumber = params.PageNumber || 1;
    let pageSize = params.PageSize || 100;
    let hasMore = true;
    const { total } = await (0, cobranzaService_1.getCobranzaByClientCountAndTotalService)({ ...params });
    while (hasMore) {
        const { cobranza } = await (0, cobranzaService_1.getCobranzaByClientService)({ ...params, PageNumber: pageNumber, PageSize: pageSize });
        if (cobranza.length > 0) {
            allSells.push(...cobranza);
            pageNumber++;
        }
        else {
            hasMore = false;
        }
        ;
    }
    return {
        sells: allSells,
        brief: total
    };
};
exports.getAllCobranzaService = getAllCobranzaService;
//# sourceMappingURL=cobranza.utils.js.map
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getAllCobranzaService = void 0;
const cobranzaService_1 = require("./cobranzaService");
const getAllCobranzaService = async (params) => {
    let allSells = [];
    let pageNumber = params.PageNumber || 1;
    let pageSize = params.PageSize || 100;
    let termSearch = '';
    let hasMore = true;
    const { brief } = await (0, cobranzaService_1.getCobranzaWithTotalsService)({ ...params });
    while (hasMore) {
        const { cobranza } = await (0, cobranzaService_1.getCobranzaService)({ ...params, PageNumber: pageNumber, PageSize: pageSize, termSearch });
        if (cobranza.length > 0) {
            //allSells = allSells.concat(cobranza);
            pageNumber++;
        }
        else {
            hasMore = false;
        }
        ;
    }
    return {
        sells: allSells,
        brief
    };
};
exports.getAllCobranzaService = getAllCobranzaService;
//# sourceMappingURL=cobranza.utils.js.map
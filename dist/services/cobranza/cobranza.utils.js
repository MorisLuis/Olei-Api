"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getAllCobranzaService = void 0;
const cobranzaService_1 = require("./cobranzaService");
const getAllCobranzaService = async (params) => {
    let allSells = [];
    let pageNumber = 1;
    const pageSize = params.PageSize || 100;
    let hasMore = true;
    // Obtenemos el resumen
    const { total } = await (0, cobranzaService_1.getCobranzaByClientCountAndTotalService)(params);
    while (hasMore) {
        const sanitizedParams = {
            ...params,
            PageNumber: pageNumber,
            PageSize: pageSize
        };
        const { cobranza } = await (0, cobranzaService_1.getCobranzaByClientService)(sanitizedParams);
        if (cobranza.length > 0) {
            allSells.push(...cobranza);
            pageNumber++;
        }
        else {
            hasMore = false;
        }
    }
    return {
        sells: allSells,
        brief: total
    };
};
exports.getAllCobranzaService = getAllCobranzaService;
//# sourceMappingURL=cobranza.utils.js.map
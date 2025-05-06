import type { SellsInterface } from "../../interface/sells";
import type { GetCobranzaByClientParamsWithPagination, totalCobranzaResponse } from "./cobranza.interface";
import { getCobranzaByClientCountAndTotalService, getCobranzaByClientService } from "./cobranzaService";


const getAllCobranzaService = async (params: GetCobranzaByClientParamsWithPagination): Promise<{ sells: SellsInterface[], brief: totalCobranzaResponse }> => {

    let allSells: SellsInterface[] = [];
    let pageNumber = params.PageNumber || 1;
    let pageSize = params.PageSize || 100;
    let hasMore = true;

    const { total } = await getCobranzaByClientCountAndTotalService({ ...params });

    while (hasMore) {
        const { cobranza } = await getCobranzaByClientService({ ...params, PageNumber: pageNumber, PageSize: pageSize });

        if (cobranza.length > 0) {
            allSells.push(...cobranza)
            pageNumber++;
        } else {
            hasMore = false;
        };

    }

    return {
        sells: allSells,
        brief: total
    };
};

export {
    getAllCobranzaService
}
import type { SellsInterface } from "../../interface/sells";
import type { CobranzaInterface, GetCobranzaByClientParamsWithPagination } from "./cobranza.interface";
import { getCobranzaByClientService, getCobranzaWithTotalsService } from "./cobranzaService";


const getAllCobranzaService = async (params: GetCobranzaByClientParamsWithPagination): Promise<{ sells: SellsInterface[], brief: CobranzaInterface }> => {

    let allSells: SellsInterface[] = [];
    let pageNumber = params.PageNumber || 1;
    let pageSize = params.PageSize || 100;
    let hasMore = true;

    const { brief } = await getCobranzaWithTotalsService({ ...params });

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
        brief
    };
};

export {
    getAllCobranzaService
}
import type { SellsInterface } from "../../interface/sells";
import type { CobranzaInterface, GetCobranzaParamsWithPagination } from "./cobranza.interface";
import { getCobranzaService, getCobranzaWithTotalsService } from "./cobranzaService";


const getAllCobranzaService = async (params: GetCobranzaParamsWithPagination): Promise<{ sells: SellsInterface[], brief: CobranzaInterface }> => {

    let allSells: SellsInterface[] = [];
    let pageNumber = params.PageNumber || 1;
    const pageSize = params.PageSize || 100;
    let hasMore = true;

    const { brief } = await getCobranzaWithTotalsService({ ...params });

    while (hasMore) {
        const sells = await getCobranzaService({ ...params, PageNumber: pageNumber, PageSize: pageSize });

        if (sells.length > 0) {
            allSells = allSells.concat(sells);
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
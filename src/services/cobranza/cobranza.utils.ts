import type { SellsInterface } from "../../interface/sells";
import type { CobranzaInterface, GetCobranzaByClientParamsWithPagination } from "./cobranza.interface";
import { getCobranzaService, getCobranzaWithTotalsService } from "./cobranzaService";


const getAllCobranzaService = async (params: GetCobranzaByClientParamsWithPagination): Promise<{ sells: SellsInterface[], brief: CobranzaInterface }> => {

    let allSells: SellsInterface[] = [];
    let pageNumber = params.PageNumber || 1;
    let pageSize = params.PageSize || 100;
    let termSearch = ''
    let hasMore = true;

    const { brief } = await getCobranzaWithTotalsService({ ...params });

    while (hasMore) {
        const { cobranza } = await getCobranzaService({ ...params, PageNumber: pageNumber, PageSize: pageSize, termSearch });

        if (cobranza.length > 0) {
            //allSells = allSells.concat(cobranza);
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
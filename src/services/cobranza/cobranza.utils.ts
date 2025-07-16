import type { SellsInterface } from "../../interface/sells";
import type { GetCobranzaByClientParams, GetCobranzaTotalResponse } from "./cobranza.interface";
import { getCobranzaByClientCountAndTotalService, getCobranzaByClientService } from "./cobranzaService";


const getAllCobranzaService = async (
    params: Omit<GetCobranzaByClientParams, 'PageNumber'>
): Promise<{ sells: SellsInterface[], brief: GetCobranzaTotalResponse }> => {

    let allSells: SellsInterface[] = [];
    let pageNumber = 1;
    const pageSize = params.PageSize || 100;
    let hasMore = true;

    // Obtenemos el resumen
    const { total } = await getCobranzaByClientCountAndTotalService(params);

    while (hasMore) {
        const sanitizedParams: GetCobranzaByClientParams = {
            ...params,
            PageNumber: pageNumber,
            PageSize: pageSize
        };

        const { cobranza } = await getCobranzaByClientService(sanitizedParams);

        if (cobranza.length > 0) {
            allSells.push(...cobranza);
            pageNumber++;
        } else {
            hasMore = false;
        }
    }

    return {
        sells: allSells,
        brief: total
    };
};



export {
    getAllCobranzaService
}
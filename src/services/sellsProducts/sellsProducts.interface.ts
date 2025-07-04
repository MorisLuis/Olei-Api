import type { SellsProductsOrderConditionType } from "../../interface/sells";
import type { UserWebSessionInterface } from "../../interface/user";


// PARAMS
interface GetSellsProductsServiceParams {
    userSession: UserWebSessionInterface;
    Marca: string | null;
    DateEnd?: string | null;
    DateExactly?: string | null;
    DateStart?: string | null;
    Descripcion: string | null;
    Codigo: string | null;
}


interface GetSellsProductsPaginatedServiceParams extends GetSellsProductsServiceParams {
    OrderCondition: SellsProductsOrderConditionType,
    PageNumber: number
};


// RESPONSE
interface GetSellsProductsPaginatedServiceResponse {
    count: number;
    totals: TotalsSellsProductsReponse;
};

interface TotalsSellsProductsReponse {
    SumaImporte: string;
    SumaImpuesto: string;
    SumaTotal: string;
}

export {
    GetSellsProductsServiceParams,
    GetSellsProductsPaginatedServiceParams,

    // RESPONSE
    GetSellsProductsPaginatedServiceResponse
}
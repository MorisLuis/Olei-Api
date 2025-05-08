import type { SellsInterface, SellsOrderConditionType } from "../../interface/sells"
import type { UserWebSessionInterface } from "../../interface/user"


// PARAMS
interface GetSellsServiceParams {
    userSession: UserWebSessionInterface,
    searchTerm: string
};

interface GetSellsPaignatedServiceParams extends GetSellsServiceParams {
    PageNumber: number,
    sellsOrderCondition: SellsOrderConditionType | string,
}

interface GetSellsByClientServiceParams {
    userSession: UserWebSessionInterface,
    Id_Cliente: number,
    TipoDoc?: SellsInterface['TipoDoc']
    FilterExpired: 0 | 1,
    FilterNotExpired: 0 | 1,
    DateEnd: string | null,
    DateExactly: string | null,
    DateStart: string | null,
};

interface GetSellsByClientPaginatedServiceParams extends GetSellsByClientServiceParams {
    SellsOrderCondition: SellsOrderConditionType | string,
    PageNumber: number,
}

// RESPONSE
interface  GetSellsTotalServiceResponse {
    count: number, 
    total: { SumaSubtotal: number, SumaTotal: number }
}



export type {
    // PARAMS
    GetSellsServiceParams,
    GetSellsPaignatedServiceParams,
    GetSellsByClientServiceParams,
    GetSellsByClientPaginatedServiceParams,

    // RESPONSE
    GetSellsTotalServiceResponse
}
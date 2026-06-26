import type { SellsDetailsInterface, SellsInterface, SellsOrderConditionType } from "../../interface/sells"
import type { UserWebSessionInterface } from "../../interface/user"


interface PostSellServiceParams {
    userSession: UserWebSessionInterface,
    Total: number,
    Subtotal: number,
    Id_Cliente: number,
    sellsDetails: Partial<SellsDetailsInterface>[],
    sellsData: Partial<SellsInterface>,
    TipoDoc: number
    Id_Almacen?: number,
};

interface PostSellServiceResponse {
    folio: string,
    TipoDoc: number,
};


// PARAMS
interface GetSellsServiceParams {
    userSession: UserWebSessionInterface,
    searchTerm: string;

    DateEnd: string | null,
    DateExactly: string | null,
    DateStart: string | null,
};

interface GetSellsPaignatedServiceParams extends GetSellsServiceParams {
    PageNumber: number,
    sellsOrderCondition: SellsOrderConditionType | string,

    DateEnd: string | null,
    DateExactly: string | null,
    DateStart: string | null,
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
interface GetSellsTotalServiceResponse {
    count: number,
    total: { SumaSubtotal: number, SumaTotal: number }
}



export type {
    PostSellServiceParams,

    // PARAMS
    GetSellsServiceParams,
    GetSellsPaignatedServiceParams,
    GetSellsByClientServiceParams,
    GetSellsByClientPaginatedServiceParams,

    // RESPONSE
    PostSellServiceResponse,
    GetSellsTotalServiceResponse
}
import type { CobranzaOrderConditionType, SellsInterface } from "../../interface/sells";
import type { UserWebSessionInterface } from "../../interface/user";

export type FilterType = 0 | 1;
interface CobranzaInterface {
    Id_Cliente: number,
    Nombre: string,
    Id_Almacen: number,
    ExpiredDays: number,
    Saldo: string,
    CorreoVtas: string
}


// PARAMS
interface GetCobranzaParams {
    userSession: UserWebSessionInterface,
    SellsOrderCondition?: CobranzaOrderConditionType | string,
    PageNumber?: number;
    PageSize?: number;
};

interface GetCobranzaWithSearchParams extends GetCobranzaParams {
    termSearch: string;
    startDate?: string
    endDate?: string
    exactlyDate?: string
}

interface GetCobranzaByClientParams extends GetCobranzaParams {
    Id_Cliente?: number,
    Id_Almacen?: number,
    TipoDoc: SellsInterface['TipoDoc']
    FilterExpired: FilterType,
    FilterNotExpired: FilterType,
    DateEnd: string | null,
    DateExactly: string | null,
    DateStart: string | null,
}


// RESPONSE
interface GetCobranzaTotalsResponse {
    SaldoVencido: number;
    SaldoNoVencido: number;
    TotalSaldo: number;
};


interface GetCobranzaTotalResponse {
    SumaSaldoVencido: number;
    SumaSaldoNoVencido: number;
    SumaTotalSaldo: number;
}

export {
    CobranzaInterface,

    //CobranzaInterface,
    GetCobranzaWithSearchParams,
    GetCobranzaByClientParams,

    // RESPONSE
    GetCobranzaTotalResponse,
    GetCobranzaTotalsResponse 
}

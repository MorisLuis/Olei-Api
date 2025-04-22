import type { SellsInterface, SellsOrderConditionType } from "../../interface/sells";
import type { UserWebSessionInterface } from "../../interface/user";

type FilterType = 0 | 1;

interface CobranzaInterface {
    SaldoVencido: number;
    SaldoNoVencido: number;
    TotalSaldo: number;
}

interface GetCobranzaInterface {
    userSession: UserWebSessionInterface,
    Id_Cliente?: number,
    TipoDoc: SellsInterface['TipoDoc']
    FilterTipoDoc: FilterType,
    FilterExpired: FilterType,
    FilterNotExpired: FilterType,
    DateEnd: string | null,
    DateExactly: string | null,
    DateStart: string | null,
    SellsOrderCondition?: SellsOrderConditionType | string
};


interface GetCobranzaParamsWithPagination extends GetCobranzaInterface {
    PageNumber: number;
    PageSize?: number;  // Hacer PageSize opcional
};

interface CobranzaInterfaceByClient extends CobranzaInterface {
    PageNumber: number;
    PageSize?: number;  // Hacer PageSize opcional
}


export {
    CobranzaInterface,
    GetCobranzaInterface,
    GetCobranzaParamsWithPagination,
    CobranzaInterfaceByClient
}

import type { CobranzaOrderConditionType, SellsInterface, SellsOrderConditionType } from "../../interface/sells";
import type { UserWebSessionInterface } from "../../interface/user";

type FilterType = 0 | 1;

interface CobranzaInterface {
    SaldoVencido: number;
    SaldoNoVencido: number;
    TotalSaldo: number;
};

interface GetCobranzaInterface {
    Id_Cliente?: number,
    Id_Almacen?: number,
    
    userSession: UserWebSessionInterface,
    termSearch: string;

    SellsOrderCondition?: CobranzaOrderConditionType | string,
    PageNumber?: number;
    PageSize?: number;  // Hacer PageSize opcional
};

interface GetCobranzaByClientInterface {
    Id_Cliente?: number,
    Id_Almacen: number,
    
    userSession: UserWebSessionInterface,
    TipoDoc: SellsInterface['TipoDoc']
    FilterExpired: FilterType,
    FilterNotExpired: FilterType,
    DateEnd: string | null,
    DateExactly: string | null,
    DateStart: string | null,
    SellsOrderCondition?: SellsOrderConditionType | string
};


// RESPONSE
interface totalCobranzaResponse {
    SumaSaldoVencido: number;
    SumaSaldoNoVencido: number;
    SumaTotalSaldo: number;
}


interface GetCobranzaByClientParamsWithPagination extends GetCobranzaByClientInterface {
    PageNumber: number;
    PageSize?: number;  // Hacer PageSize opcional
};

interface CobranzaInterfaceByClient extends CobranzaInterface {
    Nombre: string
}


export {
    CobranzaInterface,
    GetCobranzaInterface,
    GetCobranzaByClientInterface,
    GetCobranzaByClientParamsWithPagination,
    CobranzaInterfaceByClient,

    // RESPONSE
    totalCobranzaResponse
}

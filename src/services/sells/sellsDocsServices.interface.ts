import type { SellsInterface, SellsOrderConditionType } from "../../interface/sells"
import type { UserWebSessionInterface } from "../../interface/user"


interface getSellsByClientServiceInterface {
    userSession: UserWebSessionInterface,
    PageNumber: number,
    Id_Cliente: number,
    SellsOrderCondition: SellsOrderConditionType | string,
    TipoDoc?: SellsInterface['TipoDoc']
    FilterExpired: 0 | 1,
    FilterNotExpired: 0 | 1,
    DateEnd: string | null,
    DateExactly: string | null,
    DateStart: string | null,
};

interface getTotalSellsServiceInterface {
    userSession: UserWebSessionInterface,
    searchTerm: string;
};

interface getTotalSellsByClientServiceInterface {
    userSession: UserWebSessionInterface,
    Id_Cliente: number,
    TipoDoc?: SellsInterface['TipoDoc']
    FilterExpired: 0 | 1,
    FilterNotExpired: 0 | 1,
    DateEnd: string | null,
    DateExactly: string | null,
    DateStart: string | null,
};

export type {
    getSellsByClientServiceInterface,
    getTotalSellsServiceInterface,
    getTotalSellsByClientServiceInterface
}
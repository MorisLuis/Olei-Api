export interface SellsInterface {
    UniqueKey?: string;
    Id_Cliente: number;
    Id_Almacen: number;
    TipoDoc: typeTipoDoc;
    Folio: number;
    Serie: string;
    Fecha: string;
    FechaEntrega?: string;
    Saldo: number;
    Total: number;
    Nombre: string;

    ExpiredDays?: number;
    Impuesto?: number;
    FechaLiq?: string;
    Piezas?: number;
}

export type typeTipoDoc = 0 | 1 | 2 | 3 | 4;
export const TipoDoc: typeTipoDoc[] = [0, 1, 2, 3, 4];

export type SellsOrderConditionType = 'Nombre' | 'Saldo' | 'Total';
export const SellsOrderCondition: SellsOrderConditionType[] = ['Nombre', 'Saldo', 'Total']

export type SellsOrderConditionByClientType = 'TipoDoc' | 'Folio' | 'Fecha' | 'FechaEntrega' | 'ExpiredDays';
export const SellsOrderByClientCondition: SellsOrderConditionByClientType[] = ['TipoDoc', 'Folio', 'Fecha', 'FechaEntrega', 'ExpiredDays']

export type SellsFilterConditionByClientType = 'TipoDoc' | 'Expired' | "Not Expired"
export const SellsFilterCondition: SellsFilterConditionByClientType[] = ['TipoDoc', 'Expired', "Not Expired"]

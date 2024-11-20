export interface SellsInterface {
    UniqueKey?: string;
    Id_Cliente: number;
    Id_Almacen: number;
    TipoDoc: 0 | 1 | 2 | 3 | 4;
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

export type SellsOrderConditionType = 'TipoDoc' | 'Folio' | 'Fecha' | 'FechaEntrega' | 'ExpiredDays';
export const SellsOrderCondition : SellsOrderConditionType[] = ['TipoDoc' , 'Folio' , 'Fecha' , 'FechaEntrega' , 'ExpiredDays']

export type SellsFilterConditionType = 'TipoDoc' | 'Expired' | "Not Expired"
export const SellsFilterCondition : SellsFilterConditionType[] = ['TipoDoc', 'Expired', "Not Expired"]

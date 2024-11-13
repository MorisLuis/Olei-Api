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

    ExpiredDays?: number;
    Impuesto?: number;
    FechaLiq?: string;
    Piezas?: number;
}

export type SellsOrderCondition = 'TipoDoc' | 'Folio' | 'Fecha' | 'FechaEntrega' | 'ExpiredDays';

export type SellsFilterCondition = 'TipoDoc' | 'Expired' | "Not Expired"
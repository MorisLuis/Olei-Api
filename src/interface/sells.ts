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
    
    Subtotal?: number;
}

export interface SellsDetailsInterface {
    Impuesto?: number | null;
    Id_Almacen: number;
    Id_ListaPrecios?: number | null;
    Folio: number;
    
    Id_Marca: number;
    Precio?: number | null;
    Cantidad?: number | null;
    Importe?: number | null;
    Descripcion?: string | null;
    Codigo: string;

    Marca?: string;
    Unidad?: string;

    TipoDoc: number;
    Serie: string;
    Partida: number;
    Costo?: number | null;
    Id_Unidad?: number | null;
    SwNs?: boolean | null;
    SKU?: string | null;
}


export type typeTipoDoc = 0 | 1 | 2 | 3 | 4 | 6;
export const TipoDoc: typeTipoDoc[] = [0, 1, 2, 3, 4];

export type SellsOrderConditionType = 'Nombre' | 'Saldo' | 'Total';
export const SellsOrderCondition: SellsOrderConditionType[] = ['Nombre', 'Saldo', 'Total'];

export type SellsOrderConditionByClientType = 'TipoDoc' | 'Folio' | 'Fecha' | 'FechaEntrega' | 'ExpiredDays';
export const SellsOrderByClientCondition: SellsOrderConditionByClientType[] = ['TipoDoc', 'Folio', 'Fecha', 'FechaEntrega', 'ExpiredDays']

export type SellsFilterConditionByClientType = 'TipoDoc' | 'Expired' | "Not Expired"
export const SellsFilterCondition: SellsFilterConditionByClientType[] = ['TipoDoc', 'Expired', "Not Expired"]


/* COBRANZA */
export type CobranzaOrderConditionType = 'Nombre' | 'ExpiredDays' | 'SaldoVencido' | 'SaldoNoVencido' | 'TotalSaldo';
export const CobranzaOrderCondition: CobranzaOrderConditionType[] = ['Nombre', 'ExpiredDays', 'SaldoVencido', 'SaldoNoVencido', 'TotalSaldo']

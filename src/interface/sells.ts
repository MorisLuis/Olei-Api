export interface SellsInterface {
    UniqueKey?: string;
    Id_Cliente: number;
    Id_Almacen: number;
    TipoDoc: typeTipoDoc;
    Folio: number;
    Serie: string;
    Fecha: string;
    FechaEntrega?: string;
    FechaExp?: string;
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

export interface SellsProductsInterface {
    Id_Almacen: number,
    TipoDoc: number,
    Folio: number,
    Partida: number,

    Codigo: string,
    Descripcion: string,
    Cantidad: number,
    Precio: number,
    Importe: number,
    Impuesto: number,
    Fecha: string;
    Marca: string
}


export type typeTipoDoc = 1 | 2 | 3;
export const TipoDoc: typeTipoDoc[] = [1, 2, 3];

export type SellsOrderConditionType = 'Nombre' | 'Total';
export const SellsOrderCondition: SellsOrderConditionType[] = ['Nombre', 'Total'];

export type SellsOrderConditionByClientType = 'TipoDoc' | 'Folio' | 'Fecha' | 'FechaEntrega' | 'ExpiredDays';
export const SellsOrderByClientCondition: SellsOrderConditionByClientType[] = ['TipoDoc', 'Folio', 'Fecha', 'FechaEntrega', 'ExpiredDays']

export type SellsFilterConditionByClientType = 'TipoDoc' | 'Expired' | "Not Expired"
export const SellsFilterCondition: SellsFilterConditionByClientType[] = ['TipoDoc', 'Expired', "Not Expired"]


/* COBRANZA */
export type CobranzaOrderConditionType = 'Nombre' | 'ExpiredDays' | 'SaldoVencido' | 'SaldoNoVencido' | 'TotalSaldo';
export const CobranzaOrderCondition: CobranzaOrderConditionType[] = ['Nombre', 'ExpiredDays', 'SaldoVencido', 'SaldoNoVencido', 'TotalSaldo']


/* SELLS PRODUCTS */
export type SellsProductsOrderConditionType = 'Folio' | 'Codigo' | 'Fecha' | 'Marca' | 'Descripcion';
export const SellsProductsOrderCondition: SellsProductsOrderConditionType[] = ['Folio', 'Codigo', 'Fecha', 'Marca', 'Descripcion']


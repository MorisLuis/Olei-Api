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
    Id_Almacen: number;
    TipoDoc: number;
    Serie: string;
    Folio: number;
    Partida: number;
    Codigo: string;
    Id_Marca: number;
    Id_ListaPrecios?: number | null;
    Cantidad?: number | null;
    Precio?: number | null;
    Importe?: number | null;
    Impuesto?: number | null;
    Retencion?: number | null;
    RetencionIVA?: number | null;
    Descripcion?: string | null;
    Descuento?: number | null;
    PrecioOrg?: number | null;
    Costo?: number | null;
    Id_Unidad?: number | null;
    NumsdeSerie?: string | null;
    SwNs?: boolean | null;
    CodigoCupon?: string | null;
    TasaImpuesto?: number | null; // Usando `money`, tratamos como `number`.
    TasaRetencion?: number | null;
    TasaRetencionIVA?: number | null;
    SKU?: string | null;
    TipoDoc_org?: number | null;
    Serie_org?: string | null;
    Folio_org?: number | null;
}


export type typeTipoDoc = 0 | 1 | 2 | 3 | 4 | 6;
export const TipoDoc: typeTipoDoc[] = [0, 1, 2, 3, 4];

export type SellsOrderConditionType = 'Nombre' | 'Saldo' | 'Total';
export const SellsOrderCondition: SellsOrderConditionType[] = ['Nombre', 'Saldo', 'Total']

export type SellsOrderConditionByClientType = 'TipoDoc' | 'Folio' | 'Fecha' | 'FechaEntrega' | 'ExpiredDays';
export const SellsOrderByClientCondition: SellsOrderConditionByClientType[] = ['TipoDoc', 'Folio', 'Fecha', 'FechaEntrega', 'ExpiredDays']

export type SellsFilterConditionByClientType = 'TipoDoc' | 'Expired' | "Not Expired"
export const SellsFilterCondition: SellsFilterConditionByClientType[] = ['TipoDoc', 'Expired', "Not Expired"]

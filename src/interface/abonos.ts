export interface Abonos {
    Id_Almacen: number;
    Folio: number;
    Fecha: Date;
    Fecha_op: Date;
    TipoMov: number;
    Id_FormaPago: number;
    Id_Banco: number;
    NumDoc: number;
    Importe: number;
    Moneda: number;
    Paridad: number;
    Estado: number;
    Descripcion?: string;
    Id_Usuario?: string;
    Id_Cliente: number;
    Id_AlmacenClte: number;
    SwBancos?: number;
    CtaOrigen?: string;
    Id_CtaDestino?: number;
    SwCFDI?: boolean;
    FolioCaja?: number;
    TipoDocA: number;
    SerieA: string;
}
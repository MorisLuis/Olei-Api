export default interface CostosInterface {
    Codigo: string;
    Id_Marca: number;
    IdOLEI?: number | null;
    Costo?: number | null;
    CostoDllr?: number | null;
    Impto: number;
    Maximo?: number | null;
    Minimo?: number | null;
    Descuento?: number | null;
    VigDescto?: Date | null;
    CodBar?: string | null;
    FactorOc?: number | null;
    Peso?: number | null;
    CostoProm?: number | null;
    SwImportado?: boolean | null;
    FechaUltCamb?: Date | null;
    Descuento2?: number | null;
    CantMinDescto?: number | null;
    CantMinDescto2?: number | null;
    Id_Clasificacion?: number | null;
}

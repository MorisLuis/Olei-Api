// This is interface is created to Olei Online because we change the cliente of the company, so we need to change the following data.
export interface ClientInterface {
    IdOLEI?: number;
    Id_Almacen?: number,
    Id_Cliente?: number,
    Nombre?: string,
    RazonSocial?: string,
    RFC?: string,
    CURP?: string,
    Calle?: string,
    NoExt?: string,
    NoInt?: string,
    Colonia?: string,
    Id_Ciudad?: number,
    CodigoPost?: string,
    Telefono1?: string,
    CorreoVtas?: string,

    Id_ListPre?: number | null,
    Id_AlmDest?: number,
    IsEmploye: boolean,
}

export type ClientOrderConditionType = 'Id_Cliente' | 'Nombre';
export const ClientOrderCondition: ClientOrderConditionType[] = ['Id_Cliente', 'Nombre']

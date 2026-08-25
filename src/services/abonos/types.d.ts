import type { UserWebSessionInterface } from "../../interface/user"

export type AbonoOrderField = "Folio" | "Fecha" | "Id_Cliente" | "cliente.Nombre" | "forma_de_pago.Nombre";
export type OrderDirection = "asc" | "desc";
export interface AbonoInterface {
    Folio: number; Id_Almacen: number; Id_Cliente: number; Id_FormaPago: number; Importe: number; Fecha: Date;
    cliente: { Nombre: string } | null; forma_de_pago: { Nombre: string } | null;
}

export interface AbonoDetailsInterface {
    Folio: number,
    TipoDoc: number,
    Fecha: Date,
    Saldo: number,
    Total: number,
}

interface getAbonosParams {
    userSession: UserWebSessionInterface
    orderField: AbonoOrderField
    orderDirection: OrderDirection

    PageNumber: number
    limit: number
    filterField?: string
    filterValue?: string
    startDate?: string
    endDate?: string
    exactlyDate?: string
}

interface getAbonoByIdParams { 
    userSession: UserWebSessionInterface
    Id_Almacen: number
    Folio: number
}

interface GetAbonoDetailsParams {
    userSession: UserWebSessionInterface
    PageNumber: number
    folio: string
}

interface getAbonosResponse {
    abonos: AbonoInterface[];
    total: number;
}

interface getAbonoByIdResponse {
    abono: AbonoInterface | null;
}

export type {
    getAbonosParams,
    getAbonoByIdParams,
    getAbonosResponse,
    getAbonoByIdResponse,
    GetAbonoDetailsParams
}

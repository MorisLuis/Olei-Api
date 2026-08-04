import type { UserSessionInterface } from "../../interface/user";
import type { VendedorInterface } from "../../interface/vendedor";

export interface GetVendedoresParams {
    userSession: UserSessionInterface;
    PageNumber: number;
    PageSize: number;
}

export interface GetVendedoresResponse {
    vendedores: VendedorInterface[];
    total: number;
}

export interface GetVendedorByIdParams {
    userSession: UserSessionInterface;
    Id_Vendedor: number;
}

export interface GetVendedorByIdResponse {
    vendedor: VendedorInterface;
}

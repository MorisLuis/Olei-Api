import type { UserSessionInterface } from "../../interface/user";

export interface getProductsByStockServiceParams{
    userSession: UserSessionInterface;
    PageSize?: number;
    PageNumber?: number;
    Id_Almacen?: string | null;
    getTotal?: boolean;
};


export interface getProductByStockAndCodeBarServiceParams {
    userSession: UserSessionInterface;
    CodBar: string;
    SKU: string;
    Codigo: string
}


export interface searchProductInventoryServiceParams {
    userSession: UserSessionInterface;
    searchTerm: string;

    // handle if we get products with codebas or not
    withCodebar: boolean
    Id_Almacen?: string | null;
}
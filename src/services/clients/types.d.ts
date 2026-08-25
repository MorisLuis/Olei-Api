import type { ClientInterface } from "../../interface/client";
import type { UserWebSessionInterface } from "../../interface/user";

//PARAMS
interface getClientsParams {
    userSession: UserWebSessionInterface
    orderField: 'Nombre' | 'Id_Cliente'
    orderDirection?: "asc" | "desc"
    PageNumber: number
    limit: number
    Nombre?: string
    Id_Cliente?: string
    Id_Almacen?: string | number
};

interface getClientIdInterface {
    userSession: UserWebSessionInterface,
    Id_Cliente: number,
    Id_Almacen: number,
};


interface getTotalClientsServiceInterface {
    userSession: UserWebSessionInterface,
    searchTerm: string;
}


interface searchClientServiceInterface {
    userSession: UserWebSessionInterface;
    term: string
};

interface updateClientParams {
    userSession: UserWebSessionInterface;
    Id_Cliente: number,
    Id_Almacen: number,
    body: Record<string, unknown>
}

// RESPONSE

interface getClientsResponse {
    clientes: ClientInterface[];
    total: number;
}


export type {
    getClientsParams,
    getClientIdInterface,
    getTotalClientsServiceInterface,
    searchClientServiceInterface,
    updateClientParams,

    // Response
    getClientsResponse
}

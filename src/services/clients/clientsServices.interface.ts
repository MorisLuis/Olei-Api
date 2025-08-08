import type { ClientInterface } from "../../interface/client";
import type { UserWebSessionInterface } from "../../interface/user";


//PARAMS

interface getClientsServiceInterface {
    skip: number
    limit: number
    userSession: UserWebSessionInterface,
    clientOrderCondition: any,
    searchTerm: string, 
    searchId?: string
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
    IdOLEI: number,
    body: ClientInterface
}

// RESPONSE

interface GetClientsServiceResult {
    clients: any[];
    total: number;
}


export type {
    getClientsServiceInterface,
    getClientIdInterface,
    getTotalClientsServiceInterface,
    searchClientServiceInterface,
    updateClientParams,

    // Response
    GetClientsServiceResult
}
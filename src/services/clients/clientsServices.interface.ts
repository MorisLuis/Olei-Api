import type { ClientInterface } from "../../interface/client";
import type { UserWebSessionInterface } from "../../interface/user";


//PARAMS

interface getClientsServiceInterface {
    PageNumber: number,
    userSession: UserWebSessionInterface,
    OrderCondition: string,
    searchTerm: string;
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

// RESPONSE

interface GetClientsServiceResult {
    clients: ClientInterface[];
    total: number;
}


export type {
    getClientsServiceInterface,
    getClientIdInterface,
    getTotalClientsServiceInterface,
    searchClientServiceInterface,

    // Response
    GetClientsServiceResult
}
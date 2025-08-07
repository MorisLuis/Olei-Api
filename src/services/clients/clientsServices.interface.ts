import type { UserWebSessionInterface } from "../../interface/user";


//PARAMS

interface getClientsServiceInterface {
    skip: number
    limit: number
    userSession: UserWebSessionInterface,
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
    clients: any[];
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
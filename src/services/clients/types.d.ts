import type { Clientes } from "@prisma/client";
import type { ClientInterface } from "../../interface/client";
import type { UserWebSessionInterface } from "../../interface/user";

import type { Prisma } from "@prisma/client";
import type { FilterPrisma } from "../../utils/prisma/types";

//PARAMS
interface getClientsParams {
    userSession: UserWebSessionInterface
    orderField: typeof Prisma.ClientesOrderByWithRelationInput
    orderDirection: "asc" | "desc"

    skip: number
    limit: number
    filters?: FilterPrisma[]
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
    body: Record<typeof ClientInterface, string | number | boolean>
}

// RESPONSE

interface getClientsResponse {
    clientes: typeof Clientes;
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
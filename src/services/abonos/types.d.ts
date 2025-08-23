import type { Prisma } from "@prisma/client/extension"
import type { UserWebSessionInterface } from "../../interface/user"
import type { FilterPrisma } from "../../utils/prisma/types"

interface getAbonosParams {
    userSession: UserWebSessionInterface
    orderField: Prisma.ABONOSOrderByWithRelationInput
    orderDirection: "asc" | "desc"

    skip: number
    limit: number
    filters?: FilterPrisma[]
    startDate?: string
    endDate?: string
    exactlyDate?: string
}

interface getAbonoByIdParams { 
    userSession: UserWebSessionInterface
    Id_Almacen: number
    Folio: number
}

interface getAbonosResponse {
    abonos: typeof abonos;
    total: number;
}

interface getAbonoByIdResponse {
    abono: typeof abonos[0];
}

export type {
    getAbonosParams,
    getAbonoByIdParams,
    getAbonosResponse,
    getAbonoByIdResponse
}
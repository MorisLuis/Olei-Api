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
}

interface getAbonosResponse {
    abonos: typeof abonos;
    total: number;
}

export type {
    getAbonosParams,
    getAbonosResponse
}
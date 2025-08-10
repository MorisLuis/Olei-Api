import type { Prisma } from "@prisma/client";
import { getPrismaClient } from "../../database/prismaConnection";
import type { getAbonosParams, getAbonosResponse } from "./types";
import { buildOrder } from "../../utils/prisma/orderFunction";
import { buildFilters } from "../../utils/prisma/filterFunction";


export const getAbonosService = async (params: getAbonosParams): Promise<getAbonosResponse> => {

    const {
        userSession: { ServidorSQL, BaseSQL },
        orderField,
        orderDirection,
        skip,
        limit,
        filters = [],
    } = params;

    const prisma = getPrismaClient(ServidorSQL, BaseSQL);

    const orderBy = buildOrder<Prisma.ABONOSOrderByWithRelationInput>(
        { field: orderField, direction: orderDirection },
        'Id_Cliente'
    );

    const where = buildFilters(filters)

    const [abonos, totalAbonos] = await Promise.all([
        prisma.aBONOS.findMany({
            skip,
            take: limit,
            orderBy,
            where,
            select: {
                Folio: true,
                Id_Almacen: true,
                Id_Cliente: true,
                Id_FormaPago: true,
                Importe: true,
                cliente: {
                    select: {
                        Nombre: true,
                    },
                },
                forma_de_pago: {
                    select: {
                        Nombre: true,
                    },
                },
                Fecha: true,
            },
        }),
        prisma.aBONOS.count({ where }),
    ]);

    return {
        abonos,
        total: totalAbonos,
    };
};

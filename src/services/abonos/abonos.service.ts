import type { Prisma } from "@prisma/client";
import { getPrismaClient } from "../../database/prismaConnection";
import type { AbonoDetailsInterface, getAbonoByIdParams, getAbonoByIdResponse, getAbonosParams, getAbonosResponse } from "./types";
import { buildOrder } from "../../utils/prisma/orderFunction";
import { buildFilters } from "../../utils/prisma/filterFunction";
import { appendDateFilter } from "../../utils/prisma/appendDateRange";
import { dbConnectionWeb } from "../../database";
import { ValidationError } from "../../errors/CustomError";
import { abonosQuery } from "../../database/querys/abonos";

export const getAbonosService = async (params: getAbonosParams): Promise<getAbonosResponse> => {

    const {
        userSession: { ServidorSQL, BaseSQL },
        orderField,
        orderDirection,
        skip,
        limit,
        filters = [],
        startDate,
        endDate,
        exactlyDate
    } = params;

    const prisma = getPrismaClient(ServidorSQL, BaseSQL);

    const orderBy = buildOrder<Prisma.ABONOSOrderByWithRelationInput>(
        { field: orderField, direction: orderDirection },
        'Id_Cliente'
    );

    const where = buildFilters(filters)
    // Append date range if provided
    appendDateFilter(where, 'Fecha', startDate, endDate, exactlyDate);

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

export const getAbonoByIdService = async (params: getAbonoByIdParams): Promise<getAbonoByIdResponse> => {

    const { userSession: { ServidorSQL, BaseSQL }, Id_Almacen, Folio } = params;
    const prisma = getPrismaClient(ServidorSQL, BaseSQL);

    const abono = await prisma.aBONOS.findUnique({
        where: {
            Id_Almacen_Folio: {
                Id_Almacen,
                Folio,
            },
        },
        select: {
            Folio: true,
            Id_Almacen: true,
            Id_Cliente: true,
            Id_FormaPago: true,
            Importe: true,
            Fecha: true,
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
        },
    });

    return { abono };

}

export const getAbonoDetailsService = async (params: { userSession: { ServidorSQL: string; BaseSQL: string }; PageNumber: number; folio: string }): Promise<{ abonoDetails: AbonoDetailsInterface[] }> => {

    const {
        userSession: { ServidorSQL, BaseSQL },
        PageNumber,
        folio
    } = params;

    const pool = await dbConnectionWeb(ServidorSQL, BaseSQL);

    if (!pool) {
        throw new ValidationError('Error al conectarse a base de datos principal');
    };

    const query = abonosQuery.getAbonoDetails;
    const requestAbonos = await pool.request()
        .input('PageNumber', PageNumber)
        .input('PageSize', 10)
        .input('Folio', folio)
        .query(query);

    const abonoDetails = requestAbonos.recordset

    return {
        abonoDetails
    };
}
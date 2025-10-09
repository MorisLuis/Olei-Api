"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getAbonoDetailsService = exports.getAbonoByIdService = exports.getAbonosService = void 0;
const prismaConnection_1 = require("../../database/prismaConnection");
const orderFunction_1 = require("../../utils/prisma/orderFunction");
const filterFunction_1 = require("../../utils/prisma/filterFunction");
const appendDateRange_1 = require("../../utils/prisma/appendDateRange");
const database_1 = require("../../database");
const CustomError_1 = require("../../errors/CustomError");
const abonos_1 = require("../../database/querys/abonos");
const getAbonosService = async (params) => {
    const { userSession: { ServidorSQL, BaseSQL }, orderField, orderDirection, skip, limit, filters = [], startDate, endDate, exactlyDate } = params;
    const prisma = (0, prismaConnection_1.getPrismaClient)(ServidorSQL, BaseSQL);
    const orderBy = (0, orderFunction_1.buildOrder)({ field: orderField, direction: orderDirection }, 'Id_Cliente');
    const where = (0, filterFunction_1.buildFilters)(filters);
    // Append date range if provided
    (0, appendDateRange_1.appendDateFilter)(where, 'Fecha', startDate, endDate, exactlyDate);
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
exports.getAbonosService = getAbonosService;
const getAbonoByIdService = async (params) => {
    const { userSession: { ServidorSQL, BaseSQL }, Id_Almacen, Folio } = params;
    const prisma = (0, prismaConnection_1.getPrismaClient)(ServidorSQL, BaseSQL);
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
};
exports.getAbonoByIdService = getAbonoByIdService;
const getAbonoDetailsService = async (params) => {
    const { userSession: { ServidorSQL, BaseSQL }, PageNumber, folio } = params;
    const pool = await (0, database_1.dbConnectionWeb)(ServidorSQL, BaseSQL);
    if (!pool) {
        throw new CustomError_1.ValidationError('Error al conectarse a base de datos principal');
    }
    ;
    const query = abonos_1.abonosQuery.getAbonoDetails;
    console.log({ folio });
    const requestAbonos = await pool.request()
        .input('PageNumber', PageNumber)
        .input('PageSize', 10)
        .input('Folio', folio)
        .query(query);
    const abonoDetails = requestAbonos.recordset;
    return {
        abonoDetails
    };
};
exports.getAbonoDetailsService = getAbonoDetailsService;
//# sourceMappingURL=abonos.service.js.map
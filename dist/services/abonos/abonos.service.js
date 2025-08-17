"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getAbonoByIdService = exports.getAbonosService = void 0;
const prismaConnection_1 = require("../../database/prismaConnection");
const orderFunction_1 = require("../../utils/prisma/orderFunction");
const filterFunction_1 = require("../../utils/prisma/filterFunction");
const getAbonosService = async (params) => {
    const { userSession: { ServidorSQL, BaseSQL }, orderField, orderDirection, skip, limit, filters = [], } = params;
    const prisma = (0, prismaConnection_1.getPrismaClient)(ServidorSQL, BaseSQL);
    const orderBy = (0, orderFunction_1.buildOrder)({ field: orderField, direction: orderDirection }, 'Id_Cliente');
    const where = (0, filterFunction_1.buildFilters)(filters);
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
//# sourceMappingURL=abonos.service.js.map
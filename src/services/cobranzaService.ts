import { dbConnectionWeb } from "../database";
import { cobranzaQuery } from "../database/querys/cobranza";
import { ValidationError } from "../errors/CustomError";
import { BriefSellsInterface, SellsInterface, SellsOrderConditionType } from "../interface/sells";
import { UserWebSessionInterface } from "../interface/user";

interface getCobranzaInterface {
    userSession: UserWebSessionInterface,
    Id_Cliente: number,
    TipoDoc: SellsInterface['TipoDoc']
    FilterTipoDoc: 0 | 1,
    FilterExpired: 0 | 1,
    FilterNotExpired: 0 | 1,
    DateEnd: string | null,
    DateExactly: string | null,
    DateStart: string | null,

    SellsOrderCondition?: SellsOrderConditionType | string,
    PageSize?: number,
    PageNumber?: number,
};

const getCobranzaService = async ({
    userSession,
    PageNumber,
    Id_Cliente,
    SellsOrderCondition,
    FilterTipoDoc,
    FilterExpired,
    FilterNotExpired,
    TipoDoc,
    DateEnd,
    DateExactly,
    DateStart,
    PageSize = 10
}: getCobranzaInterface): Promise<SellsInterface[]> => {


    const { ServidorSQL, BaseSQL } = userSession;
    const pool = await dbConnectionWeb(ServidorSQL, BaseSQL);
    if (!pool) {
        throw new ValidationError('Error al conectarse a base de datos principal');
    };

    let query = cobranzaQuery.getCobranza;
    const request = await pool.request()
        .input('PageNumber', PageNumber)
        .input('PageSize', PageSize)
        .input('Id_Cliente', Id_Cliente)
        .input('OrderCondition', SellsOrderCondition)
        .input('FilterTipoDoc', FilterTipoDoc)
        .input('FilterExpired', FilterExpired)
        .input('FilterNotExpired', FilterNotExpired)
        .input('DateStart', DateStart)
        .input('DateEnd', DateEnd)
        .input('DateExactly', DateExactly)
        .input('TipoDoc', TipoDoc)
        .query(query);

    const sells = request.recordset
    return sells
};

const getTotalCobranzaService = async ({
    userSession,
    Id_Cliente,
    FilterTipoDoc,
    FilterExpired,
    FilterNotExpired,
    TipoDoc,
    DateEnd,
    DateExactly,
    DateStart
}: getCobranzaInterface): Promise<number> => {

    const { ServidorSQL, BaseSQL } = userSession;
    const pool = await dbConnectionWeb(ServidorSQL, BaseSQL);
    if (!pool) {
        throw new ValidationError('Error al conectarse a base de datos principal');
    };

    let query = cobranzaQuery.getTotalCobranza;
    const request = await pool.request()
        .input('Id_Cliente', Id_Cliente)
        .input('FilterTipoDoc', FilterTipoDoc)
        .input('FilterExpired', FilterExpired)
        .input('FilterNotExpired', FilterNotExpired)
        .input('DateStart', DateStart)
        .input('DateEnd', DateEnd)
        .input('DateExactly', DateExactly)
        .input('TipoDoc', TipoDoc)
        .query(query);

    const total = request.recordset[0].TotalCount
    return total
};

const getCobranzaWithTotalsService = async ({
    userSession,
    Id_Cliente,
    FilterTipoDoc,
    FilterExpired,
    FilterNotExpired,
    SellsOrderCondition,
    TipoDoc,
    DateEnd,
    DateExactly,
    DateStart
}: getCobranzaInterface): Promise<{ brief: BriefSellsInterface }> => {

    const { ServidorSQL, BaseSQL } = userSession;
    const pool = await dbConnectionWeb(ServidorSQL, BaseSQL);
    if (!pool) {
        throw new ValidationError('Error al conectarse a base de datos principal');
    };
    let query = cobranzaQuery.getCobranzaWithTotals;

    const request = await pool.request()
        .input('Id_Cliente', Id_Cliente)
        .input('FilterTipoDoc', FilterTipoDoc)
        .input('FilterExpired', FilterExpired)
        .input('FilterNotExpired', FilterNotExpired)
        .input('OrderCondition', SellsOrderCondition)
        .input('DateStart', DateStart)
        .input('DateEnd', DateEnd)
        .input('DateExactly', DateExactly)
        .input('TipoDoc', TipoDoc)
        .query(query);

    const recordsets = Array.isArray(request.recordsets) ? request.recordsets : Object.values(request.recordsets);
    const brief = recordsets[0][0] as BriefSellsInterface;

    return {
        brief
    }
};


/* UTILS */
const getAllCobranzaService = async (params: getCobranzaInterface): Promise<{ sells: SellsInterface[], brief: BriefSellsInterface }> => {
    let allSells: SellsInterface[] = [];
    let pageNumber = params.PageNumber || 1;
    const pageSize = params.PageSize || 100;
    let hasMore = true;

    const { brief } = await getCobranzaWithTotalsService({ ...params, PageNumber: pageNumber, PageSize: pageSize });
    
    while (hasMore) {
        const sells = await getCobranzaService({ ...params, PageNumber: pageNumber, PageSize: pageSize });

        if (sells.length > 0) {
            allSells = allSells.concat(sells);
            pageNumber++;
        } else {
            hasMore = false;
        };

    }
    return {
        sells: allSells,
        brief
    };
};


export {
    getCobranzaService,
    getAllCobranzaService,
    getCobranzaWithTotalsService,
    getTotalCobranzaService
}
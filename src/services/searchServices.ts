import { dbConnectionWeb, querys } from "../database";
import { UnauthorizedError } from "../errors/CustomError";
import { handleGetWebSession } from "../utils/Redis/getSession";

interface searchServiceInterface {
    sessionId: string;
    searchTerm: string;
}

const searchFamiliaService = async ({
    sessionId,
    searchTerm
}: searchServiceInterface): Promise<{ familias: { Nombre: string }[] }> => {

    const { user: userFR } = await handleGetWebSession({ sessionId });

    if (!userFR) {
        throw new UnauthorizedError('Sesion terminada')
    }

    const { Serverweb, Baseweb } = userFR;
    const pool = await dbConnectionWeb(Serverweb, Baseweb);

    const result = await pool.request()
        .input('Nombre', searchTerm)
        .query(querys.getFamilias);

    const familias = result?.recordset;

    return {
        familias
    }

};

const searchMarcaService = async ({
    sessionId,
    searchTerm
}: searchServiceInterface): Promise<{ marcas: { Nombre: string }[] }> => {

    const { user: userFR } = await handleGetWebSession({ sessionId });

    if (!userFR) {
        throw new UnauthorizedError('Sesion terminada')
    }

    const { Serverweb, Baseweb } = userFR;
    const pool = await dbConnectionWeb(Serverweb, Baseweb);

    const result = await pool.request()
        .input('Nombre', searchTerm)
        .query(querys.getMarcas);

    const marcas = result?.recordset;

    return {
        marcas
    }

};

const searchCodigoService = async ({
    sessionId,
    searchTerm
}: searchServiceInterface): Promise<{ codigos: { Codigo: string }[] }> => {

    const { user: userFR } = await handleGetWebSession({ sessionId });

    if (!userFR) {
        throw new UnauthorizedError('Sesion terminada')
    }

    const { Serverweb, Baseweb } = userFR;
    const pool = await dbConnectionWeb(Serverweb, Baseweb);

    const result = await pool.request()
        .input('Codigo', searchTerm)
        .query(querys.getFolios);

    const codigos = result?.recordset;

    return {
        codigos
    }

};


export {
    searchFamiliaService,
    searchMarcaService,
    searchCodigoService
}
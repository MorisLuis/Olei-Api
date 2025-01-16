import { dbConnection, querys } from "../database";
import BadRequestError from "../errors/BadRequestError";
import { handleGetWebSession } from "../utils/Redis/getSession";


interface searchServiceInterface {
    sessionId: string;
    searchTerm: string;
}

const searchFamiliaService = async ({
    sessionId,
    searchTerm
}: searchServiceInterface) => {

    const { user: userFR } = await handleGetWebSession({ sessionId });

    if (!userFR) {
        throw new BadRequestError({ code: 401, message: "Sesion terminada", logging: true });
    }

    const { Serverweb, Baseweb } = userFR;
    const pool = await dbConnection(Serverweb, Baseweb);

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
}: searchServiceInterface) => {

    const { user: userFR } = await handleGetWebSession({ sessionId });

    if (!userFR) {
        throw new BadRequestError({ code: 401, message: "Sesion terminada", logging: true });
    }

    const { Serverweb, Baseweb } = userFR;
    const pool = await dbConnection(Serverweb, Baseweb);

    const result = await pool.request()
        .input('Nombre', searchTerm)
        .query(querys.getMarcas);

    const marcas = result?.recordset;

    return {
        marcas
    }

};

const searcCodigoService = async ({
    sessionId,
    searchTerm
}: searchServiceInterface ) => {

    const { user: userFR } = await handleGetWebSession({ sessionId });

    if (!userFR) {
        throw new BadRequestError({ code: 401, message: "Sesion terminada", logging: true });
    }

    const { Serverweb, Baseweb } = userFR;
    const pool = await dbConnection(Serverweb, Baseweb);

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
    searcCodigoService
}
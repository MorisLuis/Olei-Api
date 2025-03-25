import { dbConnectionWeb, querys } from "../database";
import { UserWebSessionInterface } from "../interface/user";

interface searchServiceInterface {
    userSession: UserWebSessionInterface;
    searchTerm: string;
}

const searchFamiliaService = async ({
    userSession,
    searchTerm
}: searchServiceInterface): Promise<{ familias: { Nombre: string }[] }> => {

    const { ServidorSQL, BaseSQL } = userSession;
    const pool = await dbConnectionWeb(ServidorSQL, BaseSQL);

    const result = await pool.request()
        .input('Nombre', searchTerm)
        .query(querys.getFamilias);

    const familias = result?.recordset;

    return {
        familias
    }

};

const searchMarcaService = async ({
    userSession,
    searchTerm
}: searchServiceInterface): Promise<{ marcas: { Nombre: string }[] }> => {


    const { ServidorSQL, BaseSQL } = userSession;
    const pool = await dbConnectionWeb(ServidorSQL, BaseSQL);

    const result = await pool.request()
        .input('Nombre', searchTerm)
        .query(querys.getMarcas);

    const marcas = result?.recordset;

    return {
        marcas
    }

};

const searchCodigoService = async ({
    userSession,
    searchTerm
}: searchServiceInterface): Promise<{ codigos: { Codigo: string }[] }> => {


    const { ServidorSQL, BaseSQL } = userSession;
    const pool = await dbConnectionWeb(ServidorSQL, BaseSQL);

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
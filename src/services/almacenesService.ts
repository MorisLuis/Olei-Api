import { dbConnectionWeb } from "../database";
import { AlamacenQuery } from "../database/querys/almacen";
import { UserSessionInterface } from "../interface/user";

interface AlmacenInterface {
    Id_Almacen: number;
    IdOLEI: number;
    Nombre: string;
}

const getAlmacenesService = async (userSession: UserSessionInterface): Promise<{ almacenes: AlmacenInterface[] }> => {

    const { ServidorSQL, BaseSQL } = userSession;
    const pool = await dbConnectionWeb(ServidorSQL, BaseSQL);
    const result = await pool.request().query(AlamacenQuery.getAlmacenes);
    const almacenes = result?.recordset;

    return {
        almacenes
    };
};

interface getAlmacenByIdServiceInterface {
    userSession: UserSessionInterface;
    Id_Almacen: number;
}

const getAlmacenByIdService = async ({ userSession, Id_Almacen }: getAlmacenByIdServiceInterface): Promise<{ almacen: AlmacenInterface }> => {


    const { ServidorSQL, BaseSQL } = userSession;
    const pool = await dbConnectionWeb(ServidorSQL, BaseSQL);

    const result = await pool.request()
        .input('Id_Almacen', Id_Almacen)
        .query(AlamacenQuery.getAlmacenById);

    const almacen = result?.recordset[0];

    return {
        almacen
    }
}

export {
    getAlmacenesService,
    getAlmacenByIdService
}
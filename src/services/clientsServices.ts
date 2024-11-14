import { dbConnection } from "../database";
import { clientsQuerys } from "../database/querys/clients";
import BadRequestError from "../errors/BadRequestError";
import { handleGetWebSession } from "../utils/Redis/getSession";

interface  getClientsServiceInterface {
    PageNumber: number,
    sessionId: string,
    OrderCondition: string
}

const getClientsService = async ({
    PageNumber,
    sessionId,
    OrderCondition
}: getClientsServiceInterface) => {

    const { user: userFR } = await handleGetWebSession({ sessionId });
    if (!userFR) {
        throw new BadRequestError({ code: 401, message: "Sesion terminada", logging: true });
    }

    const { Serverweb, Baseweb } = userFR;
    const pool = await dbConnection(Serverweb, Baseweb);
    if (!pool) {
        throw new BadRequestError({ code: 500, message: `No se pudo establecer la conexión con la base de datos.`, logging: true });
    };

    let query = clientsQuerys.getClients;
    const request = await pool.request()
        .input('PageNumber', PageNumber)
        .input('PageSize', 10)
        .input('OrderCondition', OrderCondition)
        .query(query);

    const quotes = request.recordset

    return quotes
};

interface  getClientIdInterface {
    sessionId: string,
    Id_Cliente: number,
    Id_Almacen: number
}

const getClientIdService = async ({
    sessionId,
    Id_Cliente,
    Id_Almacen
}: getClientIdInterface) => {

    const { user: userFR } = await handleGetWebSession({ sessionId });
    if (!userFR) {
        throw new BadRequestError({ code: 401, message: "Sesion terminada", logging: true });
    }

    const { Serverweb, Baseweb } = userFR;
    const pool = await dbConnection(Serverweb, Baseweb);
    if (!pool) {
        throw new BadRequestError({ code: 500, message: `No se pudo establecer la conexión con la base de datos.`, logging: true });
    };

    if (!Id_Cliente) {
        throw new BadRequestError({ code: 500, message: 'Es necesario el id de el cliente', logging: true });
    }

    if (!Id_Almacen) {
        throw new BadRequestError({ code: 500, message: 'Es necesario el id de el almacen', logging: true });
    }

    let query = clientsQuerys.getClientId;
    const request = await pool.request()
        .input('Id_Cliente', Id_Cliente)
        .input('Id_Almacen', Id_Almacen)
        .query(query);

    const quotes = request.recordset

    return quotes
};

export {
    getClientsService,
    getClientIdService
}
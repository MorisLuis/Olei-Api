import { dbConnection } from "../database";
import { orderQuerys } from "../database/querys/orders";
import BadRequestError from "../errors/BadRequestError";
import { handleGetWebSession } from "../utils/Redis/getSession";
import sql from 'mssql';

interface getOrderDetailsSellsInterface {
    PageNumber: number;
    folio: string;
    sessionId: string;
}

const getOrderDetailsSells = async ({
    PageNumber,
    folio,
    sessionId
}: getOrderDetailsSellsInterface) => {

    const { user: userFR } = await handleGetWebSession({ sessionId });

    if (!userFR) {
        throw new BadRequestError({ code: 401, message: "Sesion terminada", logging: true });
    };
    const { Serverweb, Baseweb } = userFR;
    const pool = await dbConnection(Serverweb, Baseweb);
    if (!pool) {
        throw new BadRequestError({ code: 500, message: "No se pudo establecer la conexión con la base de datos", logging: true });
    };

    const query = orderQuerys.getOrderDetails;
    const request = await pool.request()
        .input('folio', sql.Int, folio)
        .input('PageNumber', sql.Int, PageNumber)
        .input('PageSize', sql.Int, 10)
        .query(query);

    const orderDetails = request.recordset

    return orderDetails;
};

interface getTotalOrderDetailsSellsInterface {
    folio: string;
    sessionId: string;
}
const getTotalOrderDetailsSells = async ({
    folio,
    sessionId
}: getTotalOrderDetailsSellsInterface) => {

    const { user: userFR } = await handleGetWebSession({ sessionId });

    if (!userFR) {
        throw new BadRequestError({ code: 401, message: "Sesion terminada", logging: true });
    };
    const { Serverweb, Baseweb } = userFR;
    const pool = await dbConnection(Serverweb, Baseweb);
    if (!pool) {
        throw new BadRequestError({ code: 500, message: "No se pudo establecer la conexión con la base de datos", logging: true });
    };

    const query = orderQuerys.getTotalOrderDetails;
    const request = await pool.request()
        .input('folio', sql.Int, folio)
        .query(query);

    const total = request.recordset[0].TotalCount

    return total;
}

export{
    getTotalOrderDetailsSells,
    getOrderDetailsSells
}
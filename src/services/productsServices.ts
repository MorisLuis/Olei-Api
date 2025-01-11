import { dbConnection, querys } from "../database";
import { productsQuerys } from "../database/querys/products";
import BadRequestError from "../errors/BadRequestError";
import { handleGetSession } from "../utils/Redis/getSession";


interface getProductsByStockServiceInterface {
    sessionId: string;
    PageSize: number;
    PageNumber: number;
}
const getProductsByStockService = async ({
    sessionId,
    PageSize,
    PageNumber
}: getProductsByStockServiceInterface) => {


    const { user: userFR } = await handleGetSession({ sessionId });

    if (!userFR) {
        throw new BadRequestError({ code: 401, message: "Sesion terminada", logging: true });
    }

    const { serverclientes, baseclientes, userId, PasswordSQL, UsuarioSQL } = userFR;
    const pool = await dbConnection(serverclientes, baseclientes, UsuarioSQL, PasswordSQL);

    const userquery = querys.getAuthLimitData;
    const requestUser = await pool.request().input('Id_Usuario', userId).query(userquery)
    const user = requestUser.recordset[0];
    console.log({user})

    if (!pool) {
        throw new BadRequestError({ code: 500, message: "No se pudo establecer la conexión con la base de datos", logging: true });
    }

    let query = productsQuerys.getAllProductsByStock;
    const request = await pool.request()
        .input('PageSize', PageSize)
        .input('PageNumber', PageNumber)
        .input('Id_ListaPrecios', user.Id_ListPre)
        .input('Almacen', user.Id_Almacen)
        .query(query);

    const productsByStock = request.recordset;

    return {
        products: productsByStock
    }
};

export {
    getProductsByStockService
}
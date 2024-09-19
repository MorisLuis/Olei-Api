import { Request, Response } from 'express'
import { dbConnection, querys } from '../../database';
import { productsQuerys } from '../../database/querys/products';
import { handleGetSession } from '../../utils/Redis/getSession';


const searchProductInventory = async (req: Request, res: Response) => {

    const { searchTerm } = req.query;

    const sessionId = req.sessionID;
    const { user: userFR } = await handleGetSession({ sessionId });

    if (!userFR) {
        return res.status(401).json({ error: 'Sesion terminada' });
    }

    const { serverclientes, baseclientes, userId, PasswordSQL, UsuarioSQL} = userFR;

    const Id_Usuario = req.id;

    try {
        const pool = await dbConnection(serverclientes, baseclientes, UsuarioSQL, PasswordSQL);

        const userquery = querys.getAuthLimitData;
        const requestUser: any = await pool.request().input('Id_Usuario', Id_Usuario).query(userquery)
        const user = requestUser.recordset[0]

        if (!pool) {
            return res.status(500).json({ error: 'Unable to establish a connection to the database' });
        }

        const query = productsQuerys.getProductsBySearchInventory;
        const result = await pool.request()
            .input("searchTerm", searchTerm)
            .input('Id_ListaPrecios', user.Id_ListPre)
            .query(query);

        const products = result.recordset

        res.json(products)


    } catch (error) {
        console.log({ error })
    }
}

export {
    searchProductInventory
}
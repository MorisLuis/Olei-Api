import { NextFunction, Request, Response } from 'express'
import { dbConnection, querys } from '../../database';
import { productsQuerys } from '../../database/querys/products';
import { guessBarcodeType } from '../../utils/identifyBarcodeType';
import { handleGetSession } from '../../utils/Redis/getSession';
import { productsWebQuerys } from '../../database/querys/productsWeb';
import BadRequestError from '../../errors/BadRequestError';
import { getProductsByStockQuerySchema } from '../../validations/productsValidations';
import { getProductsByStockService } from '../../services/productsServices';


const getProducById = async (req: Request, res: Response, next: NextFunction) => {

    try {
        const { id } = req.params;
        const { Marca } = req.query;
        const Id_Usuario = req.id;

        const sessionId = req.sessionID;
        const { user: userFR } = await handleGetSession({ sessionId });

        if (!userFR) {
            throw new BadRequestError({ code: 401, message: "Sesion terminada", logging: true });
        }

        const { ServidorSQL, BaseSQL, PasswordSQL, UsuarioSQL, Id_Almacen } = userFR;
        const pool = await dbConnection(ServidorSQL, BaseSQL, UsuarioSQL, PasswordSQL);

        const userquery = querys.getAuthLimitData;
        const requestUser = await pool.request().input('Id_Usuario', Id_Usuario).query(userquery)
        const user = requestUser.recordset[0]

        if (!pool) {
            throw new BadRequestError({ code: 500, message: "No se pudo establecer la conexión con la base de datos", logging: true });
        }

        let query = productsWebQuerys.getProducById

        if(
            userFR.BaseSQL === 'OLEIDB1_ROSCO' ||
            userFR.BaseSQL === 'OLEIDB1_ROSCO_TEST'
            ) {
            // We have to modify query to ROSCO
            query = productsWebQuerys.getProducByIdROSCO
        };

        const result = await pool.request()
            .input("Codigo", id)
            .input("Marca", Marca)
            .input("ListaPrecios", user.Id_ListPre)
            .input("Almacen", Id_Almacen)
            .input("baseSQL", BaseSQL)
            .query(query);

        const product = result?.recordset[0];

        return res.json(product);
    } catch (error) {
        next(error)
    }
}

const getProductsByStock = async (req: Request, res: Response, next: NextFunction) => {

    try {
        const { PageNumber, PageSize } = getProductsByStockQuerySchema.parse(req.query);
        const sessionId = req.sessionID;

        const { products } = await getProductsByStockService({
            sessionId,
            PageNumber,
            PageSize
        })

        res.json(products);

    } catch (error) {
        next(error)
    }
};

const getTotalOfProductsByStock = async (req: Request, res: Response, next: NextFunction) => {

    try {
        const Id_Usuario = req.id;

        const sessionId = req.sessionID;
        const { user: userFR } = await handleGetSession({ sessionId });

        if (!userFR) {
            throw new BadRequestError({ code: 401, message: "Sesion terminada", logging: true });
        }

        const { ServidorSQL, BaseSQL, PasswordSQL, UsuarioSQL, Id_Almacen } = userFR;
        const pool = await dbConnection(ServidorSQL, BaseSQL, UsuarioSQL, PasswordSQL);

        const userquery = querys.getAuthLimitData;
        const requestUser = await pool.request().input('Id_Usuario', Id_Usuario).query(userquery)
        const user = requestUser.recordset[0]

        if (!pool) {
            throw new BadRequestError({ code: 500, message: "No se pudo establecer la conexión con la base de datos", logging: true });
        }

        let query = productsQuerys.getTotalOfAllProductsByStock;

        const request = await pool.request()
            .input('Id_ListaPrecios', user.Id_ListPre)
            .input('Almacen', Id_Almacen)
            .query(query);

        const TotalProductos = request.recordset;

        res.json(TotalProductos);

    } catch (error) {
        next(error)
    }
};

const getProductByStockAndCodeBar = async (req: Request, res: Response, next: NextFunction) => {


    try {
        const { CodBar, Codigo } = req.query;
        const sessionId = req.sessionID;
        const { user: userFR } = await handleGetSession({ sessionId });

        if (!userFR) {
            throw new BadRequestError({ code: 401, message: "Sesion terminada", logging: true });
        }

        const { ServidorSQL, BaseSQL, userId, PasswordSQL, UsuarioSQL, Id_Almacen } = userFR;
        const pool = await dbConnection(ServidorSQL, BaseSQL, UsuarioSQL, PasswordSQL);

        const userquery = querys.getAuthLimitData;
        const requestUser = await pool.request().input('Id_Usuario', userId).query(userquery)
        const user = requestUser.recordset[0]

        if (!pool) {
            throw new BadRequestError({ code: 500, message: "No se pudo establecer la conexión con la base de datos", logging: true });
        }


        let isEAN13orUPC14 = false;
        if (CodBar) {
            isEAN13orUPC14 = guessBarcodeType(CodBar)
        }

        let request;

        if (isEAN13orUPC14) {
            let query = productsQuerys.getProductByStockAndCodeBarDV;
            request = await pool.request()
                .input("CodBar", CodBar === 'undefined' ? null : CodBar)
                .input('Id_ListaPrecios', user.Id_ListPre)
                .input('Id_Almacen', Id_Almacen)
                .query(query);

        } else {
            let query = productsQuerys.getProductByStockAndCodeBar;
            request = await pool.request()
                .input("CodBar", CodBar === 'undefined' ? null : CodBar)
                .input("Codigo", Codigo === 'undefined' ? null : Codigo)
                .input('Id_ListaPrecios', user.Id_ListPre)
                .input('Id_Almacen', Id_Almacen)
                .query(query);

        }
        const productByStockAndCodeBar = request.recordset;
        res.json(productByStockAndCodeBar)

    } catch (error) {
        next(error)
    }
};




export {
    getProducById,
    getProductsByStock,
    getTotalOfProductsByStock,
    getProductByStockAndCodeBar
}
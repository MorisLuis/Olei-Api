import { NextFunction, Request, Response } from 'express'
import { dbConnection, querys } from '../../database';
import { productsQuerys } from '../../database/querys/products';
import { guessBarcodeType } from '../../utils/identifyBarcodeType';
import { handleGetSession } from '../../utils/Redis/getSession';
import { productsWebQuerys } from '../../database/querys/productsWeb';
import { getProductsByStockQuerySchema } from '../../validations/productsValidations';
import { getProductsByStockService } from '../../services/productsServices';
import { UnauthorizedError, ValidationError } from '../../errors/CustomError';


const getProducById = async (req: Request, res: Response, next: NextFunction) => {

    try {
        const { id } = req.params;
        const { Marca } = req.query;
        const Id_Usuario = req.Id_mobile;

        const sessionId = req.sessionID;
        const { user: userFR } = await handleGetSession({ sessionId });

        if (!userFR) {
            throw new UnauthorizedError('Sesion terminada')
        }

        const { ServidorSQL, BaseSQL, PasswordSQL, UsuarioSQL, Id_Almacen, Id_ListPre } = userFR;
        const pool = await dbConnection(ServidorSQL, BaseSQL, UsuarioSQL, PasswordSQL);


        if (!pool) {
            throw new ValidationError('Error al conectarse a base de datos principal');
        }

        let query = productsWebQuerys.getProducById

        if (
            userFR.BaseSQL === 'OLEIDB1_ROSCO' ||
            userFR.BaseSQL === 'OLEIDB1_ROSCO_TEST'
        ) {
            // We have to modify query to ROSCO
            query = productsWebQuerys.getProducByIdROSCO
        };

        const result = await pool.request()
            .input("Codigo", id)
            .input("Marca", Marca)
            .input("ListaPrecios", Id_ListPre)
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
        const Id_Usuario = req.Id_mobile;
        const sessionId = req.sessionID;
        const { user: userFR } = await handleGetSession({ sessionId });

        if (!userFR) {
            throw new UnauthorizedError('Sesión terminada');
        }

        const { ServidorSQL, BaseSQL, PasswordSQL, UsuarioSQL, Id_Almacen, Id_ListPre} = userFR;
        const pool = await dbConnection(ServidorSQL, BaseSQL, UsuarioSQL, PasswordSQL);

        if (!pool) {
            throw new ValidationError('Error al conectarse a base de datos principal');
        }

        let query = productsQuerys.getTotalOfAllProductsByStock;
        const request = await pool.request()
            .input('Id_ListaPrecios', Id_ListPre)
            .input('Almacen', Id_Almacen)
            .query(query);

        const TotalProductos = request.recordset;
        res.json(TotalProductos);

    } catch (error) {
        next(error);
    }
};

const getProductByStockAndCodeBar = async (req: Request, res: Response, next: NextFunction) => {


    try {
        const { CodBar, Codigo, SKU } = req.query;
        const sessionId = req.sessionID;
        const { user: userFR } = await handleGetSession({ sessionId });

        if (!userFR) {
            throw new UnauthorizedError('Sesion terminada')
        }

        const { ServidorSQL, BaseSQL, PasswordSQL, UsuarioSQL, Id_Almacen, Id_ListPre } = userFR;
        const pool = await dbConnection(ServidorSQL, BaseSQL, UsuarioSQL, PasswordSQL);

        let isEAN13orUPC14 = false;
        if (CodBar) {
            isEAN13orUPC14 = guessBarcodeType(CodBar)
        }

        let request;

        // This is an excepcion for codebar
        if (isEAN13orUPC14) { 
            let query = productsQuerys.getProductByStockAndCodeBarDV;
            request = await pool.request()
                .input("CodBar", CodBar === 'undefined' ? null : CodBar)
                .input('Id_ListaPrecios', Id_ListPre)
                .input('Id_Almacen', Id_Almacen)
                .input('SKU', SKU)
                .query(query);

        } else {
            let query = productsQuerys.getProductByStockAndCodeBar;
            request = await pool.request()
                .input("CodBar", CodBar === 'undefined' ? null : CodBar)
                .input("Codigo", Codigo === 'undefined' ? null : Codigo)
                .input('Id_ListaPrecios', Id_ListPre)
                .input('Id_Almacen', Id_Almacen)
                .input('SKU', SKU)
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
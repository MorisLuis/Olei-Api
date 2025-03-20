import { NextFunction, Request, Response } from 'express'
import { dbConnection } from '../../database';
import { handleGetSession } from '../../utils/Redis/getSession';
import { productsWebQuerys } from '../../database/querys/productsWeb';
import { getProductByStockAndCodeBarSchema, getProductsByStockQuerySchema } from '../../validations/productsValidations';
import { getProductByStockAndCodeBarService, getProductsByStockService, searchProductByStockService } from '../../services/productsServices';
import { UnauthorizedError, ValidationError } from '../../errors/CustomError';
import { searchProductInventoryQuerySchema } from '../../validations/inventoryValidations';

const getProducById = async (req: Request, res: Response, next: NextFunction): Promise<Response | void> => {

    try {
        const { id } = req.params;
        const { Marca } = req.query;

        const sessionId = req.sessionID;
        const { user: userFR } = await handleGetSession({ sessionId });

        if (!userFR) {
            return next(new UnauthorizedError('Usuario no encontrado en la sesión'));
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

const getProductsByStock = async (req: Request, res: Response, next: NextFunction): Promise<Response | void> => {

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

const getTotalOfProductsByStock = async (req: Request, res: Response, next: NextFunction): Promise<Response | void> => {
    try {
        const sessionId = req.sessionID;

        const { products: TotalProductos } = await getProductsByStockService({
            sessionId,
            getTotal: true
        })

        res.json(TotalProductos);

    } catch (error) {
        next(error);
    }
};

const getProductByStockAndCodeBar = async (req: Request, res: Response, next: NextFunction): Promise<Response | void> => {

    try {
        const { CodBar, Codigo, SKU } = getProductByStockAndCodeBarSchema.parse(req.query);
        const sessionId = req.sessionID;

        const { productByStockAndCodeBar } = await getProductByStockAndCodeBarService({
            CodBar,
            Codigo,
            SKU,
            sessionId
        })

        res.json(productByStockAndCodeBar)

    } catch (error) {
        next(error)
    }
};

const searchProductInventory = async (req: Request, res: Response, next: NextFunction): Promise<Response | void> => {

    try {
        const { searchTerm } = searchProductInventoryQuerySchema.parse(req.query);
        const sessionId = req.sessionID;
        console.log({sessionId})
        const { products } = await searchProductByStockService({
            sessionId,
            searchTerm: searchTerm,
            withCodebar: true
        })

        return res.json(products);

    } catch (error) {
        return next(error);
    }
};

const searchProductInventoryWithoutCodebar = async (req: Request, res: Response, next: NextFunction): Promise<Response | void> => {

    try {
        const { searchTerm } = searchProductInventoryQuerySchema.parse(req.query);

        const sessionId = req.sessionID;
        const { products } = await searchProductByStockService({
            sessionId,
            searchTerm: searchTerm,
            withCodebar: false
        })

        return res.json(products);

    } catch (error) {
        return next(error);
    }
};

export {
    getProducById,
    getProductsByStock,
    getTotalOfProductsByStock,
    getProductByStockAndCodeBar,
    searchProductInventory,
    searchProductInventoryWithoutCodebar
}
import type { NextFunction, Request, Response } from 'express'
import { dbConnection } from '../../database';
import { productsWebQuerys } from '../../database/querys/productsWeb';
import { getProductByStockAndCodeBarSchema, getProductsByStockQuerySchema } from '../../validations/productsValidations';
import { getProductByStockAndCodeBarService, getProductsByStockService, searchProductByStockService } from '../../services/productsServices';
import { UnauthorizedError, ValidationError } from '../../errors/CustomError';
import { searchProductInventoryQuerySchema } from '../../validations/inventoryValidations';

const getProducById = async (req: Request, res: Response, next: NextFunction): Promise<Response | void> => {

    try {
        const { id } = req.params;
        const { Marca } = req.query;

        const userSession = req.session;
        const { ServidorSQL, BaseSQL, PasswordSQL, UsuarioSQL, Id_Almacen, Id_ListPre } = userSession;
        const pool = await dbConnection(ServidorSQL, BaseSQL, UsuarioSQL, PasswordSQL);

        if (!pool) {
            throw new ValidationError('Error al conectarse a base de datos principal');
        }

        let query = productsWebQuerys.getProducById

        if (
            userSession.BaseSQL === 'OLEIDB1_ROSCO' ||
            userSession.BaseSQL === 'OLEIDB1_ROSCO_TEST'
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

        return res.json({
            product
        });
    } catch (error) {
        next(error)
    }
}

const getProductsByStock = async (req: Request, res: Response, next: NextFunction): Promise<Response | void> => {

    try {
        const { PageNumber, PageSize } = getProductsByStockQuerySchema.parse(req.query);
        const userSession = req.session;

        if (!userSession) {
            throw new UnauthorizedError('Sesion terminada')
        }

        const { products } = await getProductsByStockService({
            userSession,
            PageNumber,
            PageSize
        });

        res.json({ products });

    } catch (error) {
        next(error)
    }
};

const getTotalOfProductsByStock = async (req: Request, res: Response, next: NextFunction): Promise<Response | void> => {
    try {
        const userSession = req.session;

        const { products: total } = await getProductsByStockService({
            userSession,
            getTotal: true
        })

        res.json({ total: total });

    } catch (error) {
        next(error);
    }
};

const getProductByStockAndCodeBar = async (req: Request, res: Response, next: NextFunction): Promise<Response | void> => {

    try {
        const { CodBar, Codigo, SKU } = getProductByStockAndCodeBarSchema.parse(req.query);
        const userSession = req.session;

        const { productByStockAndCodeBar } = await getProductByStockAndCodeBarService({
            CodBar,
            Codigo,
            SKU,
            userSession
        })

        res.json({ products: productByStockAndCodeBar })

    } catch (error) {
        next(error)
    }
};

const searchProductInventory = async (req: Request, res: Response, next: NextFunction): Promise<Response | void> => {

    try {
        const { searchTerm } = searchProductInventoryQuerySchema.parse(req.query);
        const userSession = req.session;
        const { products } = await searchProductByStockService({
            userSession,
            searchTerm: searchTerm,
            withCodebar: true
        })

        return res.json({ products });

    } catch (error) {
        return next(error);
    }
};

const searchProductInventoryWithoutCodebar = async (req: Request, res: Response, next: NextFunction): Promise<Response | void> => {

    try {
        const { searchTerm } = searchProductInventoryQuerySchema.parse(req.query);

        const userSession = req.session;
        const { products } = await searchProductByStockService({
            userSession,
            searchTerm: searchTerm,
            withCodebar: false
        })

        return res.json({ products });

    } catch (error) {
        return next(error);
    }
};


const errorTest = (
    _req: Request,
    _res: Response,
    next: NextFunction
): Response | void => {
    try {
        // Se genera un error intencional para probar el manejo de errores
        const error = new Error('Error intencional del servidor') as any;
        error.status = 500;
        // Se pasa al siguiente middleware de manejo de errores
        next(error);
    } catch (err) {
        next(err);
    }
};
export {
    getProducById,
    getProductsByStock,
    getTotalOfProductsByStock,
    getProductByStockAndCodeBar,
    searchProductInventory,
    searchProductInventoryWithoutCodebar,

    errorTest
}
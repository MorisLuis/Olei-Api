import type { NextFunction, Request, Response } from 'express'
import { dbConnection } from '../../database';
import { productsWebQuerys } from '../../database/querys/productsWeb';
import { getProductByStockAndCodeBarSchema, getProductsByStockQuerySchema } from '../../validations/productsValidations';
import { getProductByStockAndCodeBarService, getProductsByStockService, searchProductByStockService } from '../../services/products/index';
import { UnauthorizedError, ValidationError } from '../../errors/CustomError';
import { searchProductInventoryQuerySchema } from '../../validations/inventoryValidations';
import { productsQuerys } from '../../database/querys/products';

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

        let query = productsQuerys.getProducById

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
            .input("Id_ListaPrecios", Id_ListPre)
            .input("Id_Almacen", Id_Almacen)
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


/**
 * @description Controller to get products by stock with pagination and optional total count.
 * @route GET /products/byStock
 * @client Mobile App
 */

const getProductsByStock = async (req: Request, res: Response, next: NextFunction): Promise<Response | void> => {

    try {
        const { PageNumber, PageSize, Id_Almacen } = getProductsByStockQuerySchema.parse(req.query);
        const userSession = req.session;

        if (!userSession) {
            throw new UnauthorizedError('Sesion terminada')
        }

        const { products } = await getProductsByStockService({
            userSession,
            PageNumber,
            PageSize,
            Id_Almacen
        });

        res.json({ products });

    } catch (error) {
        next(error)
    }
};

/**
 * @description Controller to get the total count of products by stock.
 * @route GET /products/byStockCount
 * @client Mobile App
 */

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

/**
 * @description Controller to get a product by stock and code bar.
 * @route GET /products/byStockAndCodeBar
 * @client Mobile App
 */

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

/**
 * @description Controller to search products in inventory ( products ) by search term.
 * @route GET /inventory/search/product
 * @client Mobile App
 */

const searchProductInventory = async (req: Request, res: Response, next: NextFunction): Promise<Response | void> => {

    try {
        const { searchTerm, Id_Almacen } = searchProductInventoryQuerySchema.parse(req.query);
        const userSession = req.session;
        const { products } = await searchProductByStockService({
            userSession,
            searchTerm: searchTerm,
            withCodebar: true,
            Id_Almacen
        })

        return res.json({ products });

    } catch (error) {
        return next(error);
    }
};


/**
 * @description Controller to search products in inventory ( products ) without code bar.
 * @route GET /inventory/search/product/withoutcodebar
 * @client Mobile App
 */

const searchProductInventoryWithoutCodebar = async (req: Request, res: Response, next: NextFunction): Promise<Response | void> => {

    try {
        const { searchTerm, Id_Almacen } = searchProductInventoryQuerySchema.parse(req.query);

        const userSession = req.session;
        const { products } = await searchProductByStockService({
            userSession,
            searchTerm: searchTerm,
            withCodebar: false,
            Id_Almacen
        })

        return res.json({ products });

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
    searchProductInventoryWithoutCodebar,

}
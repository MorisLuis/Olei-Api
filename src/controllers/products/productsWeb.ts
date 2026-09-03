import type { NextFunction, Request, Response } from 'express'
import { getProducByIdWebService, getProductsService, getTotalProductsService, searchProductService } from '../../services/productsServices';
import { getProducByIdWebQuerySchema, getProductsQuerySchema, getTotalProductsQuerySchema, serachProductQuerySchema } from '../../validations/productsValidations';
import type ProductInterface from '../../interface/product';

/** @description Returns CRM products filtered by name, brand, family, and folio with pagination.
 * @client CRM
 * @router GET /api/product
 * @request Validated filter and pagination query values; requires the CRM web tenant session.
 * @response JSON containing `products`; failures are forwarded to `next`.
 */
const getProducts = async (
    req: Request,
    res: Response,
    next: NextFunction
): Promise<Response<{ products: ProductInterface[] }> | void> => {

    try {
        const userSession = req.sessionWeb;
        const { nombre, marca, familia, folio, page, limit } = getProductsQuerySchema.parse(req.query);

        const { products } = await getProductsService({
            userSession,
            nombre,
            marca,
            familia,
            folio,
            page,
            limit
        });

        const response: { products: ProductInterface[] } = { products };
        return res.json(response);

    } catch (error) {
        return next(error);
    }
};


/** @description Returns CRM product details by code and optional brand.
 * @client CRM
 * @router GET /api/product/web/:id
 * @request Route parameter `id` and validated `Marca` query value; requires the CRM web tenant session.
 * @response JSON containing `product`; failures are forwarded to `next`.
 */
const getProducByIdWeb = async (
    req: Request,
    res: Response,
    next: NextFunction
): Promise<Response<{ product: ProductInterface }> | void> => {

    try {
        const userSession = req.sessionWeb;
        const { id: codigo } = req.params;
        const { Marca } = getProducByIdWebQuerySchema.parse(req.query);

        const { product } = await getProducByIdWebService({
            userSession,
            codigo,
            Marca
        });

        const response: { product: ProductInterface } = { product };
        return res.json(response);

    } catch (error) {
        return next(error)
    }
}

/** @description Returns the total CRM products matching the supplied filters.
 * @client CRM
 * @router GET /api/product/count
 * @request Validated name, brand, family, and folio query values; requires the CRM web tenant session.
 * @response JSON containing `total`; failures are forwarded to `next`.
 */
const getTotalProducts = async (
    req: Request,
    res: Response,
    next: NextFunction
): Promise<Response<{ total: number }> | void> => {

    try {
        const userSession = req.sessionWeb;
        const { nombre, marca, familia, folio } = getTotalProductsQuerySchema.parse(req.query);

        const { total } = await getTotalProductsService({
            userSession,
            nombre,
            marca,
            familia,
            folio
        })

        const response: { total: number } = { total };
        return res.json(response);

    } catch (error) {
        return next(error)
    }
};

/** @description Searches CRM products by name, family, code, and brand.
 * @client CRM
 * @router GET /api/product/search
 * @request Validated search query values; requires the CRM web tenant session.
 * @response JSON containing `products`; failures are forwarded to `next`.
 */
const searchProduct = async (
    req: Request, 
    res: Response, 
    next: NextFunction
    ): Promise<Response<{ products: ProductInterface[] }> | void> => {

    try {
        const userSession = req.sessionWeb;
        const { nombre, familia, codigo, marca } = serachProductQuerySchema.parse(req.query);

        const { products } = await searchProductService({
            userSession,
            nombre,
            familia,
            codigo,
            marca
        })

        const response: { products: ProductInterface[] } = { products };
        return res.json(response);
    } catch (error) {
        return next(error)
    }
};

export {
    getProducts,
    getProducByIdWeb,
    getTotalProducts,
    searchProduct
}

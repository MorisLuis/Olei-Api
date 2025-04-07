import type { NextFunction, Request, Response } from 'express'
import { getProducByIdWebService, getProductsService, getTotalProductsService, searchProductService } from '../../services/productsServices';
import { getProducByIdWebQuerySchema, getProductsQuerySchema, getTotalProductsQuerySchema, serachProductQuerySchema } from '../../validations/productsValidations';
import type ProductInterface from '../../interface/product';

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
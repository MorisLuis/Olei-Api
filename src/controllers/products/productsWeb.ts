import { NextFunction, Request, Response } from 'express'
import { dbConnection } from '../../database';
import sql from 'mssql';
import { handleGetWebSession } from '../../utils/Redis/getSession';
import { productsWebQuerys } from '../../database/querys/productsWeb';
import BadRequestError from '../../errors/BadRequestError';
import { getProducByIdWebService, getProductsService, getTotalProductsService, searchProductService } from '../../services/productsServices';
import { getProducByIdWebQuerySchema, getProductsQuerySchema, getTotalProductsQuerySchema, serachProductQuerySchema } from '../../validations/productsValidations';

const getProducts = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const sessionId = req.sessionRedis;
        const { nombre, marca, familia, folio, page, limit } = getProductsQuerySchema.parse(req.query);

        const { products } = await getProductsService({
            sessionId,
            nombre,
            marca,
            familia,
            folio,
            page,
            limit
        });

        res.json({
            products
        });

    } catch (error) {
        next(error)
    }
};

const getProducByIdWeb = async (req: Request, res: Response, next: NextFunction) => {

    try {
        // Get session from REDIS.
        const sessionId = req.sessionRedis;
        const { id: codigo } = req.params;
        const { Marca } = getProducByIdWebQuerySchema.parse(req.query);

        const { product } = await getProducByIdWebService({
            sessionId,
            codigo,
            Marca
        });

        return res.json(product);
    } catch (error) {
        next(error)
    }
}

const getTotalProducts = async (req: Request, res: Response, next: NextFunction) => {

    try {
        // Get session from REDIS.
        const sessionId = req.sessionRedis;
        const { nombre, marca, familia, folio } = getTotalProductsQuerySchema.parse(req.query);

        const { total } = await getTotalProductsService({
            sessionId,
            nombre,
            marca,
            familia,
            folio
        })

        res.json({ total });

    } catch (error) {
        next(error)
    }
};

const searchProduct = async (req: Request, res: Response, next: NextFunction) => {

    try {
        // Get session from REDIS.
        const sessionId = req.sessionRedis;
        const { nombre, familia, codigo, marca } = serachProductQuerySchema.parse(req.query);

        const { products } = await searchProductService({
            sessionId,
            nombre,
            familia,
            codigo,
            marca
        })

        res.json({
            products
        });
    } catch (error) {
        next(error)
    }
};

export {
    getProducts,
    getProducByIdWeb,
    getTotalProducts,
    searchProduct
}
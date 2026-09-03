import type { NextFunction, Request, Response } from 'express'
import { searchCodigoService, searchFamiliaService, searchMarcaService } from '../../services/searchServices';
import { simpleSearchQuerySchema } from '../../validations/searchValidations';


/** 
 * @description Searches E-commerce product families by name.
 * @client E-commerce
 * @router GET /api/search/familias
 * @request Validated `searchTerm` query value.
 * @session Requires the E-commerce web tenant session.
 * @response JSON containing `familias`; failures are forwarded to `next`.
 */
const getFamilias = async (req: Request, res: Response, next: NextFunction): Promise<Response | void> => {

    try {
        const { searchTerm } = simpleSearchQuerySchema.parse(req.query);
        const userSession = req.sessionWeb

        const { familias } = await searchFamiliaService({
            userSession,
            searchTerm
        });

        return res.json({
            familias
        });

    } catch (error) {
        return next(error)
    }
};

/** 
 * @description Searches E-commerce product brands by name.
 * @client E-commerce
 * @router GET /api/search/marcas
 * @request Validated `searchTerm` query value.
 * @session Requires the E-commerce web tenant session.
 * @response JSON containing `marcas`; failures are forwarded to `next`.
 */
const getMarcas = async (req: Request, res: Response, next: NextFunction): Promise<Response | void> => {

    try {

        const { searchTerm } = simpleSearchQuerySchema.parse(req.query);
        const userSession = req.sessionWeb

        const { marcas } = await searchMarcaService({
            userSession,
            searchTerm
        });

        return res.json({
            marcas
        });
    } catch (error) {
        return next(error)
    }
};

/**
 * @description Searches E-commerce product codes.
 * @client E-commerce
 * @router GET /api/search/codigos
 * @request Validated `searchTerm` query value.
 * @session Requires the E-commerce web tenant session.
 * @response JSON containing `codigos`; failures are forwarded to `next`.
 */
const getCodigos = async (req: Request, res: Response, next: NextFunction): Promise<Response | void> => {

    try {
        const { searchTerm } = simpleSearchQuerySchema.parse(req.query);
        const userSession = req.sessionWeb

        const { codigos } = await searchCodigoService({
            userSession,
            searchTerm
        });

        return res.json({
            codigos
        });
    } catch (error) {
        return next(error)
    }
};


export {
    getFamilias,
    getMarcas,
    getCodigos
}

import { NextFunction, Request, Response } from 'express'
import { searchCodigoService, searchFamiliaService, searchMarcaService } from '../../services/searchServices';
import { simpleSearchQuerySchema } from '../../validations/searchValidations';


const getFamilias = async (req: Request, res: Response, next: NextFunction): Promise<Response | void> => {

    try {
        const { searchTerm } = simpleSearchQuerySchema.parse(req.query);
        const sessionId = req.sessionRedis

        const { familias } = await searchFamiliaService({
            sessionId,
            searchTerm
        });

        return res.json({
            familias
        });

    } catch (error) {
        return next(error)
    }
};

const getMarcas = async (req: Request, res: Response, next: NextFunction): Promise<Response | void> => {

    try {

        const { searchTerm } = simpleSearchQuerySchema.parse(req.query);
        const sessionId = req.sessionRedis

        const { marcas } = await searchMarcaService({
            sessionId,
            searchTerm
        });

        return res.json({
            marcas
        });
    } catch (error) {
        return next(error)
    }
};

const getCodigos = async (req: Request, res: Response, next: NextFunction): Promise<Response | void> => {

    try {
        const { searchTerm } = simpleSearchQuerySchema.parse(req.query);
        const sessionId = req.sessionRedis

        const { codigos } = await searchCodigoService({
            sessionId,
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
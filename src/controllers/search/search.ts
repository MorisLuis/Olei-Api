import { NextFunction, Request, Response } from 'express'
import { searchCodigoService, searchFamiliaService, searchMarcaService } from '../../services/searchServices';
import { simpleSearchQuerySchema } from '../../validations/searchValidations';


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
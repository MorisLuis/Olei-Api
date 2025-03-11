import { NextFunction, Request, Response } from 'express'
import { searchCodigoService, searchFamiliaService, searchMarcaService } from '../../services/searchServices';
import { simpleSearchQuerySchema } from '../../validations/searchValidations';


const getFamilias = async (req: Request, res: Response, next: NextFunction) => {

    const { searchTerm } = simpleSearchQuerySchema.parse(req.query);
    const sessionId = req.sessionRedis

    const { familias } = await searchFamiliaService({
        sessionId,
        searchTerm
    });

    res.json({
        familias
    });
};

const getMarcas = async (req: Request, res: Response, next: NextFunction) => {

    const { searchTerm } = simpleSearchQuerySchema.parse(req.query);
    const sessionId = req.sessionRedis

    const { marcas } = await searchMarcaService({
        sessionId,
        searchTerm
    });

    res.json({
        marcas
    });
};

const getCodigos = async (req: Request, res: Response, next: NextFunction) => {

    const { searchTerm } = simpleSearchQuerySchema.parse(req.query);
    const sessionId = req.sessionRedis

    const { codigos } = await searchCodigoService({
        sessionId,
        searchTerm
    });

    res.json({
        codigos
    });
};


export {
    getFamilias,
    getMarcas,
    getCodigos
}
import { NextFunction, Request, Response } from 'express'
import { searcCodigoService, searchAlmacenesService, searchFamiliaService, searchMarcaService } from '../../services/searchServices';
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

    const { codigos } = await searcCodigoService({
        sessionId,
        searchTerm
    });

    res.json({
        codigos
    });
};

const getAlmacenes = async (req: Request, res: Response, next: NextFunction) => {

    const { searchTerm } = simpleSearchQuerySchema.parse(req.query);
    const sessionId = req.sessionID;

    const { almacenes } = await searchAlmacenesService({
        sessionId,
        nombre: searchTerm
    });

    res.json({
        almacenes
    });
}

export {
    getFamilias,
    getMarcas,
    getCodigos,
    getAlmacenes
}
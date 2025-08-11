import type { NextFunction, Request, Response } from 'express';
import { getAbonosService } from '../../services/abonos/abonos.service';
import { getAbonosQuerySchema } from './abonos.schema';
import { parsePrismaFilter } from '../../utils/prisma/parsePrismaFilter';


const getAbonos = async (req: Request, res: Response, next: NextFunction): Promise<Response | void> => {

    try {
        const {
            PageNumber,
            limit,
            orderField,
            orderDirection,
            filterField,
            filterValue
        } = getAbonosQuerySchema.parse(req.query);
    
        const skip = (PageNumber - 1) * limit;
        const userSession = req.sessionWeb;
        const filters = parsePrismaFilter(filterField, filterValue)

        const { abonos } = await getAbonosService({
            userSession,
            orderField,
            orderDirection,
            skip,
            limit,
            filters
        })

        return res.json({
            abonos
        })

    } catch (error) {
        return next(error)
    }
}


export {
    getAbonos
}
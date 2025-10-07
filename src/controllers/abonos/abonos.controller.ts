import type { NextFunction, Request, Response } from 'express';
import { getAbonoByIdService, getAbonoDetailsService, getAbonosService } from '../../services/abonos/abonos.service';
import { getAbonoByIdParamsSchema, getAbonoByIdQuerySchema, getAbonosQuerySchema } from './abonos.schema';
import { parsePrismaFilter } from '../../utils/prisma/parsePrismaFilter';


const getAbonos = async (req: Request, res: Response, next: NextFunction): Promise<Response | void> => {

    try {
        const {
            PageNumber,
            limit,
            orderField,
            orderDirection,
            filterField,
            filterValue,
            startDate,
            endDate,
            exactlyDate
        } = getAbonosQuerySchema.parse(req.query);

        const skip = (PageNumber - 1) * limit;
        const userSession = req.sessionWeb;
        const filters = parsePrismaFilter(filterField, filterValue)

        const { abonos, total } = await getAbonosService({
            userSession,
            orderField,
            orderDirection,
            skip,
            limit,
            filters,
            startDate,
            endDate,
            exactlyDate
        })

        return res.json({
            abonos,
            total
        })

    } catch (error) {
        return next(error)
    }
}

const getAbonoById = async (req: Request, res: Response, next: NextFunction): Promise<Response | void> => {
    try {
        const { folio: Folio } = getAbonoByIdParamsSchema.parse(req.params);
        const { Id_Almacen } = getAbonoByIdQuerySchema.parse(req.query);

        const userSession = req.sessionWeb;

        const abono = await getAbonoByIdService({
            userSession,
            Id_Almacen,
            Folio
        });

        return res.json(abono);
    } catch (error) {
        return next(error);
    }
}

const getAbonoDetails = async (req: Request, res: Response, next: NextFunction): Promise<Response | void> => {

    try {
        const { folio } = req.params
        const { PageNumber } = req.query

        const { abonoDetails } = await getAbonoDetailsService({
            userSession: req.sessionWeb,
            PageNumber : Number(PageNumber) || 1,
            folio
        });

        return res.json({ abonoDetails });

    } catch (error) {
        return next(error)
    }
}

export {
    getAbonos,
    getAbonoById,
    getAbonoDetails
}
import type { NextFunction, Request, Response } from 'express';
import { getAbonoByIdService } from '../../services/abonos/getAbonoById.service';
import { getAbonoDetailsService } from '../../services/abonos/getAbonoDetails.service';
import { getAbonosService } from '../../services/abonos/getAbonos.service';
import { getAbonoByIdParamsSchema, getAbonoByIdQuerySchema, getAbonosQuerySchema } from './abonos.schema';



/** @description Returns filtered, ordered, and paginated CRM abonos with their total count.
 * @client CRM
 * @router GET /api/abonos
 * @request Validated filters, dates, ordering, and pagination from the query string.
 * @session Requires the CRM web tenant session.
 * @response JSON containing `abonos` and `total`; failures are forwarded to `next`.
 */
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

        const userSession = req.sessionWeb;

        const { abonos, total } = await getAbonosService({
            userSession,
            orderField,
            orderDirection,
            PageNumber,
            limit,
            filterField,
            filterValue,
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

/** @description Returns one CRM abono identified by folio and warehouse.
 * @client CRM
 * @router GET /api/abonos/:folio
 * @request Validated `folio` route parameter and `Id_Almacen` query parameter.
 * @session Requires the CRM web tenant session.
 * @response JSON with the service result; failures are forwarded to `next`.
 */
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

/** @description Returns paginated detail rows for a CRM abono folio.
 * @client CRM
 * @router GET /api/abonos/details/:folio
 * @request `folio` route parameter and optional `PageNumber` query parameter.
 * @session Requires the CRM web tenant session.
 * @response JSON containing `abonoDetails`; failures are forwarded to `next`. The current router order may shadow this route.
 */
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

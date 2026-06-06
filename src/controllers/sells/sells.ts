import type { NextFunction, Request, Response } from "express"
import { getSellsService, getSellsByClientService, getSellByIdService, getSellsCountAndTotalService, getSellsByClientCountAndTotalService, postSellService } from "../../services/sells/sellsDocsServices";
import { sellsReportService } from "../../services/sells/sellsReport.service";
import { getClientParamsSchema, getSellsQuerySchema, getSellByIdQuerySchema, getFolioParamsSchema, getSellsByClientQuerySchema, getSellsCountAndTotalQuerySchema, getSellsByClientCountAndTotalQuerySchema, postSellBodySchema } from '../../validations/sellsValidations'

const postSell = async (req: Request, res: Response, next: NextFunction): Promise<Response | void> => {

    try {
        const userSession = req.sessionWeb;
        const { sellsDetails, sellsData , Id_Cliente} = postSellBodySchema.parse(req.body);
        const { Subtotal, Total } = sellsData;

        const { folio, TipoDoc } = await postSellService({
            sellsData,
            sellsDetails,
            userSession,
            Subtotal,
            Total,
            Id_Cliente
        });

        return res.status(201).json({
            ok: true,
            folio,
            TipoDoc
        });
    } catch (error) {
        return next(error);
    }
};

const getSells = async (req: Request, res: Response, next: NextFunction): Promise<Response | void> => {

    try {
        const { PageNumber, sellsOrderCondition, searchTerm, DateEnd, DateExactly, DateStart } = getSellsQuerySchema.parse(req.query)
        const userSession = req.sessionWeb;

        const { sells } = await getSellsService({
            userSession,
            PageNumber,
            sellsOrderCondition,
            searchTerm,
            DateEnd: DateEnd || null,
            DateExactly: DateExactly || null,
            DateStart: DateStart || null
        });

        return res.json({
            sells
        });

    } catch (error) {
        return next(error);
    };

};

const getSellsCountAndTotal = async (req: Request, res: Response, next: NextFunction): Promise<Response | void> => {

    try {

        const { searchTerm, DateStart, DateEnd, DateExactly } = getSellsCountAndTotalQuerySchema.parse(req.query)
        const userSession = req.sessionWeb;

        const { count, total } = await getSellsCountAndTotalService({
            userSession,
            searchTerm,
            DateEnd: DateEnd || null,
            DateExactly: DateExactly || null,
            DateStart: DateStart || null
        });

        return res.json({
            count, 
            total
        });

    } catch (error) {
        return next(error);
    }
}

const getSellsByClient = async (req: Request, res: Response, next: NextFunction): Promise<Response | void> => {

    try {

        const { PageNumber, sellsOrderCondition, FilterExpired, FilterNotExpired, TipoDoc, DateEnd, DateExactly, DateStart } = getSellsByClientQuerySchema.parse(req.query);
        const { client } = getClientParamsSchema.parse(req.params);

        const userSession = req.sessionWeb;
        const { sells } = await getSellsByClientService({
            userSession,
            Id_Cliente: client,
            PageNumber,
            SellsOrderCondition: sellsOrderCondition,
            TipoDoc,
            FilterNotExpired,
            FilterExpired,
            DateEnd: DateEnd || null,
            DateExactly: DateExactly || null,
            DateStart: DateStart || null,
        });

        return res.json({
            sells
        });
    } catch (error) {
        return next(error);
    }
};

const getSellsByClientCountAndTotal = async (req: Request, res: Response, next: NextFunction): Promise<Response | void> => {

    try {

        const { FilterExpired, FilterNotExpired, TipoDoc, DateEnd, DateExactly, DateStart } = getSellsByClientCountAndTotalQuerySchema.parse(req.query);
        const { client } = getClientParamsSchema.parse(req.params);

        const userSession = req.sessionWeb;
        const { count, total } = await getSellsByClientCountAndTotalService({
            userSession,
            Id_Cliente: client,
            TipoDoc,
            FilterNotExpired,
            FilterExpired,
            DateEnd: DateEnd || null,
            DateExactly: DateExactly || null,
            DateStart: DateStart || null,
        });

        return res.json({
            count, 
            total
        });
    } catch (error) {
        return next(error);
    }
};

const getSellById = async (req: Request, res: Response, next: NextFunction): Promise<Response | void> => {

    try {
        // Get session from REDIS.
        const userSession = req.sessionWeb;

        const { Serie, Id_Almacen, TipoDoc } = getSellByIdQuerySchema.parse(req.query);
        const { folio } = getFolioParamsSchema.parse(req.params);

        const sell = await getSellByIdService(
            userSession,
            folio,
            Serie,
            Id_Almacen,
            TipoDoc
        );

        return res.json({
            sell
        });
    } catch (error) {
        return next(error);
    };

};

const getSellReportById = async (req: Request, res: Response, next: NextFunction): Promise<Response | void> => {
    
    try {
        const userSession = req.sessionWeb;
        const { folio } = getFolioParamsSchema.parse(req.params);
        const mode = req.query.mode === 'blob' ? 'blob' : 'response';

        const report = await sellsReportService(userSession, folio);

        if (mode === 'blob') {
            return res.json({
                ok: true,
                fileName: report.fileName,
                mimeType: report.mimeType,
                blob: report.blob,
            });
        }

        res.setHeader('Content-Type', report.mimeType);
        res.setHeader('Content-Disposition', `inline; filename="${report.fileName}"`);

        return res.status(200).send(report.pdfBuffer);

    } catch (error) {
        return next(error);
    }
}

export {
    postSell,
    getSells,
    getSellsCountAndTotal,
    getSellsByClient,
    getSellsByClientCountAndTotal,
    getSellById,
    getSellReportById
}
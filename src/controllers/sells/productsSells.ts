
import type { NextFunction, Request, Response } from "express"
import {  getSellsProductsCountAndTotalQuerySchema, getSellsProductsQuerySchema } from "../../validations/sellsProductsValidations";
import { getSellsProductsCountAndTotalService, getSellsProductsService } from "../../services/sellsProducts/sellsProducts";


const getSellsProducts = async (req: Request, res: Response, next: NextFunction): Promise<Response | void> => {

    try {
        const { Marca, PageNumber, DateEnd, DateExactly, DateStart, Descripcion, OrderCondition, Codigo } = getSellsProductsQuerySchema.parse(req.query);
        const userSession = req.sessionWeb;

        const { sells } = await getSellsProductsService({
            userSession,
            PageNumber,
            Marca: Marca || null,
            DateEnd: DateEnd || null,
            DateExactly: DateExactly || null,
            DateStart: DateStart || null,
            Descripcion: Descripcion || null,
            Codigo: Codigo || null,
            OrderCondition
        })

        return res.json({
            sells
        });
    
    } catch (error) {
        return next(error);
    };

};

const getSellsProductsCountAndTotal = async (req: Request, res: Response, next: NextFunction): Promise<Response | void> => {

    try {

        const { Marca, DateEnd, DateExactly, DateStart, Descripcion, Codigo } = getSellsProductsCountAndTotalQuerySchema.parse(req.query);
        const userSession = req.sessionWeb;

        const { count, totals } = await getSellsProductsCountAndTotalService({
            userSession,
            Marca: Marca || null,
            DateEnd: DateEnd || null,
            DateExactly: DateExactly || null,
            DateStart: DateStart || null,
            Descripcion: Descripcion || null,
            Codigo: Codigo || null
        });

        return res.json({
            count,
            totals
        });
    
    } catch (error) {
        return next(error);
    };


};


export {
    getSellsProducts,
    getSellsProductsCountAndTotal
}
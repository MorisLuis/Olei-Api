import type { NextFunction, Request, Response } from "express";
import { successResponse } from "../../helpers/response";
import { getVendedorByIdService, getVendedoresService } from "../../services/vendedores";
import { getVendedorByIdParamsSchema, getVendedoresQuerySchema } from "./vendedores.schema";

export const getVendedores = async (
    req: Request,
    res: Response,
    next: NextFunction,
): Promise<Response | void> => {
    try {
        const { PageNumber, PageSize, Nombre } = getVendedoresQuerySchema.parse(req.query);
        const { vendedores, total } = await getVendedoresService({
            userSession: req.session,
            PageNumber,
            PageSize,
            Nombre,
        });

        return successResponse(req, res, vendedores, "Operation successful", 200, {
            totals: {
                show: vendedores.length,
                total,
            },
            pages: {
                current: PageNumber,
                totalPages: Math.ceil(total / PageSize),
            },
        });
    } catch (error) {
        return next(error);
    }
};

export const getVendedorById = async (
    req: Request,
    res: Response,
    next: NextFunction,
): Promise<Response | void> => {
    try {
        const { id: Id_Vendedor } = getVendedorByIdParamsSchema.parse(req.params);
        const { vendedor } = await getVendedorByIdService({
            userSession: req.session,
            Id_Vendedor,
        });

        return successResponse(req, res, vendedor);
    } catch (error) {
        return next(error);
    }
};

import type { NextFunction, Request, Response } from "express";
import { successResponse } from "../../helpers/response";
import { getVendedorByIdService, getVendedoresService } from "../../services/vendedores";
import { getVendedorByIdParamsSchema, getVendedoresQuerySchema } from "./vendedores.schema";

/** @description Returns filtered and paginated sellers for the authenticated App tenant.
 * @client App
 * @router GET /api/vendedores
 * @request Validated name and pagination query values; requires the App tenant session.
 * @response Standard success response containing sellers and pagination metadata; failures are forwarded to `next`.
 */
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

/** @description Returns one seller by identifier from the authenticated App tenant.
 * @client App
 * @router GET /api/vendedores/:id
 * @request Validated `id` route parameter; requires the App tenant session.
 * @response Standard success response containing the seller; not-found and service failures are forwarded to `next`.
 */
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

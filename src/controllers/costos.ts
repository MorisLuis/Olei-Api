import type { NextFunction, Request, Response } from 'express';
import { updateCodebarService } from '../services/codebarService';
import { updateCodbarQuerySchema } from '../validations/costosValidations';

/**
 * @description Updates a product barcode for the authenticated App tenant.
 * @client App
 * @router PUT /api/costos
 * @request Validated query and body values for the product, brand, barcode, and random code.
 * @session Requires the App tenant session.
 * @response JSON containing the updated `codigo` and `CodBar`; validation and service failures are forwarded to `next`.
 */
const updateCostos = async (req: Request, res: Response, next: NextFunction) : Promise<Response | void> => {

    const userSession = req.session;
    const { codigo: codigoParam, Id_Marca } = updateCodbarQuerySchema.parse(req.query);
    const body = req.body;

    try {
        const { CodBar, codigo } = await updateCodebarService(
            userSession,
            codigoParam,
            Id_Marca,
            body
        );

        return res.json({
            CodBar, codigo
        })
    } catch (error) {
        return next(error)
    };

};


export {
    updateCostos
}

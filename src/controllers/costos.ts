import type { NextFunction, Request, Response } from 'express';
import { updateCodebarService } from '../services/codebarService';
import { updateCodbarQuerySchema } from '../validations/costosValidations';

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

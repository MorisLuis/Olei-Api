import { NextFunction, Request, Response } from 'express';
import { updateCodebarService } from '../services/codebarService';
import { updateCodbarQuerySchema } from '../validations/costosValidations';

const updateCostos = async (req: Request, res: Response, next: NextFunction) => {

    const sessionId = req.sessionID;
    const { codigo: codigoParam, Id_Marca } = updateCodbarQuerySchema.parse(req.query);
    const body = req.body;

    try {
        const resp = await updateCodebarService(
            sessionId,
            codigoParam,
            Id_Marca,
            body
        );

        res.json({
            resp
        })
    } catch (error) {
        console.log({error})
        next(error)
    };

};


export {
    updateCostos
}

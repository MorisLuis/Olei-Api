import { NextFunction, Request, Response } from 'express';
import { updateCodebarService } from '../services/codebarService';

const updateCostos = async (req: Request, res: Response, next: NextFunction) => {

    const sessionId = req.sessionID;
    const { codigo: codigoParam, Id_Marca } = req.query;
    const body = req.body;

    try {
        const resp = await updateCodebarService(
            sessionId,
            codigoParam as string,
            Id_Marca as string,
            body
        );

        res.json({
            resp
        })
    } catch (error) {
        next(error)
    };

};


export {
    updateCostos
}

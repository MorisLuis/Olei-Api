import type { Request, Response } from 'express';
import type { ErrorLogData} from '../services/errorService';
import { errorsService } from '../services/errorService';
import { AppError } from '../errors/CustomError';

/** 
 * @description Validates and stores a client-submitted error record in the central database.
 * @client Unclear - this endpoint is unauthenticated and accepts a caller-provided `From` value.
 * @router POST /api/errors
 * @request Error metadata from the request body.
 * @response JSON confirming storage or an error response produced by this controller.
 */
const handleErrors = async (req: Request, res: Response): Promise<Response | void> => {

    try {
        await errorsService(req.body);
        return res.json({ ok: true });
    } catch (error) {
        new AppError(`[ErrorController] - ${error}`)
        return res.status(500).json({ ok: false, msg: 'Error interno del servidor' });
    }

};

interface handleErrorsEndpointInterface {
    From: string,
    Message: string,
    Id_Usuario: string,
    Metodo: string,
    code: string
};

const handleErrorsEndpoint = async ({
    From,
    Message,
    Id_Usuario,
    Metodo,
    code
}: handleErrorsEndpointInterface): Promise<Response | void> => {


    const body: ErrorLogData = {
        From,
        Message,
        Id_Usuario,
        Metodo,
        code
    }

    try {
        await errorsService(body);
    } catch (error) {
        throw new AppError(`[ErrorController] - ${error}`)
    }

}

export {
    handleErrors,
    handleErrorsEndpoint
}

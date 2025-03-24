import { NextFunction, Request, Response } from "express";
import { getAlmacenByIdService, getAlmacenesService } from "../services/almacenesService";
import { getAlmacenByIdQuerySchema } from "../validations/almacenValidations";
import { UserSessionInterface } from "../interface/user";
import { UnauthorizedError } from "../errors/CustomError";
import { updateSession } from "../helpers/generate-redis";

const getAlmacenes = async (req: Request, res: Response, next: NextFunction): Promise<Response | void> => {

    try {
        const userSession = req.session;
        const { almacenes } = await getAlmacenesService(userSession);

        return res.json({
            almacenes
        });

    } catch (error) {
        return next(error)
    }
};

const updateAlmacenInRedis = async (req: Request, res: Response, next: NextFunction): Promise<Response | void> => {

    try {

        const { Id_Almacen } = getAlmacenByIdQuerySchema.parse(req.query);
        const userSession = req.session;
        const sessionId = req.sessionId;

        const { almacen } = await getAlmacenByIdService({
            userSession,
            Id_Almacen
        });

        if (!almacen) {
            return res.status(404).json({ message: 'Almacen no encontrado' });
        }

        if (almacen.Id_Almacen) {
            if (!userSession) {
                throw new UnauthorizedError('User session is not defined');
            }

            const datosDelUsuario: UserSessionInterface = {
                ...userSession,
                Id_Almacen: almacen.Id_Almacen,
                AlmacenNombre: almacen.Nombre ?? '',
            };


            updateSession(sessionId, datosDelUsuario)
        }

        return res.json(almacen);

    } catch (error) {
        return next(error)
    };

};

export {
    getAlmacenes,
    updateAlmacenInRedis
}
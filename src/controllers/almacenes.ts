import type { NextFunction, Request, Response } from "express";
import { getAlmacenByIdService, getAlmacenesService } from "../services/almacenesService";
import { getAlmacenByIdQuerySchema } from "../validations/almacenValidations";
import type { UserSessionInterface } from "../interface/user";
import { NotFoundError, UnauthorizedError } from "../errors/CustomError";
import { updateSession } from "../services/auth/database/session.service";

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

        if (!userSession) {
            throw new UnauthorizedError('User session is not defined');
        };

        const { almacen } = await getAlmacenByIdService({
            userSession,
            Id_Almacen
        });

        if (!almacen) {
            throw new NotFoundError('Almacen no encontrado')
        }

        if (almacen.Id_Almacen) {
            const datosDelUsuario: UserSessionInterface = {
                ...userSession,
                Id_Almacen: almacen.Id_Almacen,
                AlmacenNombre: almacen.Nombre ?? '',
            };

            await updateSession(sessionId, datosDelUsuario)
        }

        return res.json({almacen});

    } catch (error) {
        return next(error)
    };

};

export {
    getAlmacenes,
    updateAlmacenInRedis
}
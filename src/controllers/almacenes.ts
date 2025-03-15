import { NextFunction, Request, Response } from "express";
import { getAlmacenByIdService, getAlmacenesService } from "../services/almacenesService";
import { getAlmacenByIdQuerySchema } from "../validations/almacenValidations";
import { UserSessionInterface } from "../interface/user";
import { UnauthorizedError } from "../errors/CustomError";

const getAlmacenes = async (req: Request, res: Response, next: NextFunction): Promise<Response | void> => {

    try {
        const sessionId = req.sessionID;
        const { almacenes } = await getAlmacenesService(sessionId);

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
        const sessionId = req.sessionID;

        const { almacen } = await getAlmacenByIdService({
            sessionId,
            Id_Almacen
        });

        if (!almacen) {
            return res.status(404).json({ message: 'Almacen no encontrado' });
        }

        if (almacen.Id_Almacen) {
            if (!req.session.user) {
                throw new UnauthorizedError('User session is not defined');
            }
        
            const datosDelUsuario: UserSessionInterface = {
                ...req.session.user,
                Id_Almacen: almacen.Id_Almacen,
                AlmacenNombre: almacen.Nombre ?? '', // Si no está disponible, usa ''
                ServidorSQL: req.session.user.ServidorSQL ?? '',
                BaseSQL: req.session.user.BaseSQL ?? '',
                UsuarioSQL: req.session.user.UsuarioSQL ?? '',
                PasswordSQL: req.session.user.PasswordSQL ?? '',
                IdUsuarioOLEI: req.session.user.IdUsuarioOLEI ?? '',
                RazonSocial: req.session.user.RazonSocial ?? '',
                SwImagenes: req.session.user.SwImagenes ?? '',
                Vigencia: req.session.user.Vigencia ?? '',
                from: req.session.user.from ?? 'mobil'
            };
        
            req.session.user = datosDelUsuario;
        }
        

        return res.json(almacen);

    } catch (error) {
        return next(error)
    };

}

export {
    getAlmacenes,
    updateAlmacenInRedis
}
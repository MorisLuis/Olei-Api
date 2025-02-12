import { NextFunction, Request, Response } from "express";
import { getAlmacenByIdService, getAlmacenesService } from "../services/almacenesService";
import { getAlmacenByIdQuerySchema } from "../validations/almacenValidations";
import { UserSessionInterface } from "../interface/user";

const getAlmacenes = async (req: Request, res: Response, next: NextFunction) => {

    try {
        const sessionId = req.sessionID;

        const { almacenes } = await getAlmacenesService({
            sessionId
        });

        res.json({
            almacenes
        });

    } catch (error) {
        next(error)
    }
};

const updateAlmacenInRedis = async (req: Request, res: Response, next: NextFunction) => {

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
            const datosDelUsuario: UserSessionInterface = {
                ...(req.session as any).user,
                Id_Almacen: almacen.Id_Almacen,
                AlmacenNombre: almacen.Nombre ?? ''
            };
            (req.session as any).user = datosDelUsuario;
        }


        res.json(almacen);


    } catch (error) {
        next(error)
    };

}

export {
    getAlmacenes,
    updateAlmacenInRedis
}
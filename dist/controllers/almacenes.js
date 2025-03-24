"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.updateAlmacenInRedis = exports.getAlmacenes = void 0;
const almacenesService_1 = require("../services/almacenesService");
const almacenValidations_1 = require("../validations/almacenValidations");
const CustomError_1 = require("../errors/CustomError");
const generate_redis_1 = require("../helpers/generate-redis");
const getAlmacenes = async (req, res, next) => {
    try {
        const userSession = req.session;
        const { almacenes } = await (0, almacenesService_1.getAlmacenesService)(userSession);
        return res.json({
            almacenes
        });
    }
    catch (error) {
        return next(error);
    }
};
exports.getAlmacenes = getAlmacenes;
const updateAlmacenInRedis = async (req, res, next) => {
    try {
        const { Id_Almacen } = almacenValidations_1.getAlmacenByIdQuerySchema.parse(req.query);
        const userSession = req.session;
        const sessionId = req.sessionId;
        const { almacen } = await (0, almacenesService_1.getAlmacenByIdService)({
            userSession,
            Id_Almacen
        });
        if (!almacen) {
            return res.status(404).json({ message: 'Almacen no encontrado' });
        }
        if (almacen.Id_Almacen) {
            if (!userSession) {
                throw new CustomError_1.UnauthorizedError('User session is not defined');
            }
            const datosDelUsuario = {
                ...userSession,
                Id_Almacen: almacen.Id_Almacen,
                AlmacenNombre: almacen.Nombre ?? '',
            };
            (0, generate_redis_1.updateSession)(sessionId, datosDelUsuario);
        }
        return res.json(almacen);
    }
    catch (error) {
        return next(error);
    }
    ;
};
exports.updateAlmacenInRedis = updateAlmacenInRedis;
//# sourceMappingURL=almacenes.js.map
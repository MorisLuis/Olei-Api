"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.updateAlmacenInRedis = exports.getAlmacenes = void 0;
const almacenesService_1 = require("../services/almacenesService");
const almacenValidations_1 = require("../validations/almacenValidations");
const CustomError_1 = require("../errors/CustomError");
const getAlmacenes = async (req, res, next) => {
    try {
        const sessionId = req.sessionID;
        const { almacenes } = await (0, almacenesService_1.getAlmacenesService)(sessionId);
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
        const sessionId = req.sessionID;
        const { almacen } = await (0, almacenesService_1.getAlmacenByIdService)({
            sessionId,
            Id_Almacen
        });
        if (!almacen) {
            return res.status(404).json({ message: 'Almacen no encontrado' });
        }
        if (almacen.Id_Almacen) {
            if (!req.session.user) {
                throw new CustomError_1.UnauthorizedError('User session is not defined');
            }
            const datosDelUsuario = {
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
    }
    catch (error) {
        return next(error);
    }
    ;
};
exports.updateAlmacenInRedis = updateAlmacenInRedis;
//# sourceMappingURL=almacenes.js.map
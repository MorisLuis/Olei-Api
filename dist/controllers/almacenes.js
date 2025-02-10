"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.updateAlmacenInRedis = exports.getAlmacenes = void 0;
const almacenesService_1 = require("../services/almacenesService");
const almacenValidations_1 = require("../validations/almacenValidations");
const getAlmacenes = async (req, res, next) => {
    try {
        const sessionId = req.sessionID;
        const { almacenes } = await (0, almacenesService_1.getAlmacenesService)({
            sessionId
        });
        res.json({
            almacenes
        });
    }
    catch (error) {
        next(error);
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
            const datosDelUsuario = {
                ...req.session.user,
                Id_Almacen: almacen.Id_Almacen
            };
            req.session.user = datosDelUsuario;
        }
        res.json(almacen);
    }
    catch (error) {
        next(error);
    }
    ;
};
exports.updateAlmacenInRedis = updateAlmacenInRedis;
//# sourceMappingURL=almacenes.js.map
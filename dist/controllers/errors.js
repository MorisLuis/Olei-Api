"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.handleErrorsEndpoint = exports.handleErrors = void 0;
const errorService_1 = require("../services/errorService");
const CustomError_1 = require("../errors/CustomError");
const handleErrors = async (req, res) => {
    try {
        await (0, errorService_1.errorsService)(req.body);
        return res.json({ ok: true });
    }
    catch (error) {
        new CustomError_1.AppError(`[ErrorController] - ${error}`);
        return res.status(500).json({ ok: false, msg: 'Error interno del servidor' });
    }
};
exports.handleErrors = handleErrors;
;
const handleErrorsEndpoint = async ({ From, Message, Id_Usuario, Metodo, code }) => {
    const body = {
        From,
        Message,
        Id_Usuario,
        Metodo,
        code
    };
    try {
        await (0, errorService_1.errorsService)(body);
    }
    catch (error) {
        throw new CustomError_1.AppError(`[ErrorController] - ${error}`);
    }
};
exports.handleErrorsEndpoint = handleErrorsEndpoint;
//# sourceMappingURL=errors.js.map
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.validateSession = void 0;
const CustomError_1 = require("../errors/CustomError");
const getSession_1 = require("../utils/Redis/getSession");
const validateSession = async (sessionId) => {
    const { user } = await (0, getSession_1.handleGetWebSession)({ sessionId });
    if (!user) {
        throw new CustomError_1.UnauthorizedError('Sesion terminada');
    }
    return { user };
};
exports.validateSession = validateSession;
//# sourceMappingURL=validateSession.js.map
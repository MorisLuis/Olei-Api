"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.validateSession = void 0;
const BadRequestError_1 = __importDefault(require("../errors/BadRequestError"));
const getSession_1 = require("../utils/Redis/getSession");
const validateSession = async (sessionId) => {
    const { user } = await (0, getSession_1.handleGetWebSession)({ sessionId });
    if (!user) {
        throw new BadRequestError_1.default({ code: 401, message: "Sesión terminada", logging: true });
    }
    return { user };
};
exports.validateSession = validateSession;
//# sourceMappingURL=validateSession.js.map
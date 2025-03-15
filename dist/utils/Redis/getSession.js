"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.handleGetWebSession = exports.handleGetSession = void 0;
const CustomError_1 = require("../../errors/CustomError");
const server_1 = require("../../models/server");
const handleGetSession = async ({ sessionId }) => {
    try {
        const sessionData = await server_1.redisClient?.get(`sess:${sessionId}`);
        const session = JSON.parse(sessionData);
        const user = session.user;
        return { user };
    }
    catch (error) {
        throw new CustomError_1.UnauthorizedError(`Error en handleGetSession: ${error}`);
    }
};
exports.handleGetSession = handleGetSession;
const handleGetWebSession = async ({ sessionId }) => {
    try {
        const sessionData = await server_1.redisClient?.get(`sess:${sessionId}`);
        const session = JSON.parse(sessionData);
        const user = session.userWeb;
        return { user };
    }
    catch (error) {
        throw new CustomError_1.UnauthorizedError(`Error en handleGetWebSession: ${error}`);
    }
};
exports.handleGetWebSession = handleGetWebSession;
//# sourceMappingURL=getSession.js.map
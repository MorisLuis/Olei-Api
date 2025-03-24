"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.updateSession = exports.handleGetWebSession = exports.handleGetSession = void 0;
const CustomError_1 = require("../../errors/CustomError");
const server_1 = require("../../models/server");
const handleGetSession = async ({ sessionId }) => {
    try {
        if (!sessionId)
            throw new CustomError_1.UnauthorizedError(`SessionId vacío`);
        const sessionData = await server_1.redisClient?.get(`session:${sessionId}`);
        if (!sessionData)
            throw new CustomError_1.UnauthorizedError('Sesión terminada');
        const session = JSON.parse(sessionData);
        return { user: session.user };
    }
    catch (error) {
        throw new CustomError_1.UnauthorizedError(`Error obteniendo sesión: ${error.message}`);
    }
};
exports.handleGetSession = handleGetSession;
const handleGetWebSession = async ({ sessionId }) => {
    try {
        if (!sessionId)
            throw new CustomError_1.UnauthorizedError(`SessionId empty`);
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
const updateSession = async (sessionId, newData) => {
    console.log({ newData });
    try {
        // Obtener la sesión actual desde Redis
        server_1.redisClient?.get(`session:${sessionId}`, (err, sessionData) => {
            if (err || !sessionData) {
                console.error('Error obteniendo la sesión o sesión no encontrada');
                return;
            }
            // Parseamos la sesión existente
            let session = JSON.parse(sessionData);
            // 🔥 Modificamos la sesión con los nuevos datos
            session = { ...session, ...newData };
            // Guardamos la sesión actualizada en Redis
            server_1.redisClient?.set(`session:${sessionId}`, JSON.stringify(session), (err) => {
                if (err) {
                    console.error('Error actualizando la sesión en Redis:', err);
                }
                else {
                    console.log('Sesión actualizada exitosamente');
                }
            });
        });
    }
    catch (error) {
        console.error('Error al actualizar la sesión:', error);
    }
};
exports.updateSession = updateSession;
//# sourceMappingURL=getSession.js.map
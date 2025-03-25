"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.updateWebSession = exports.getRedisWebSession = exports.generateRedisSessionWeb = exports.handleDeleteRedisSession = exports.updateSession = exports.getRedisSession = exports.generateRedisSession = void 0;
const redisClient_1 = __importDefault(require("../config/redisClient"));
const CustomError_1 = require("../errors/CustomError");
// Generar sesion de redis.
const generateRedisSession = async (sessionId, datosDelUsuario) => {
    try {
        const result = await redisClient_1.default.set(`session:${sessionId}`, JSON.stringify(datosDelUsuario), 'EX', 3600);
        if (!result) {
            throw new CustomError_1.AppError('Error al generar la sesión en Redis', 500);
        }
        return result;
    }
    catch (error) {
        throw new CustomError_1.AppError(`Error en generateRedisSession: ${error}`, 500);
    }
};
exports.generateRedisSession = generateRedisSession;
// Obtener la sesión desde Redis
const getRedisSession = async (sessionId) => {
    try {
        const sessionData = await redisClient_1.default?.get(`session:${sessionId}`);
        if (!sessionData) {
            throw new CustomError_1.NotFoundError('Sesión no encontrada en Redis');
        }
        return JSON.parse(sessionData);
    }
    catch (error) {
        throw new CustomError_1.AppError(`Error en generateRedisSession: ${error}`, 500);
    }
};
exports.getRedisSession = getRedisSession;
// Actualizar la sesión en Redis
const updateSession = async (sessionId, newData) => {
    try {
        let session = await (0, exports.getRedisSession)(sessionId);
        if (!session) {
            throw new CustomError_1.NotFoundError('Sesión no encontrada en Redis');
        }
        session = { ...session, ...newData };
        const result = await redisClient_1.default.set(`session:${sessionId}`, JSON.stringify(session), 'EX', 3600);
        if (!result) {
            throw new CustomError_1.AppError('Error al actualizar la sesión en Redis', 500);
        }
        return session;
    }
    catch (error) {
        throw new CustomError_1.AppError(`Error en updateSession: ${error}`, 500);
    }
};
exports.updateSession = updateSession;
// Eliminar la sesión en Redis.
const handleDeleteRedisSession = async (sessionId) => {
    try {
        const response = await redisClient_1.default.del(`session:${sessionId}`);
        if (response === 0) {
            throw new CustomError_1.NotFoundError('Sesión no encontrada en Redis');
        }
        console.log(`✅ Sesión ${sessionId} eliminada exitosamente`);
    }
    catch (error) {
        throw new CustomError_1.AppError(`Error en handleDeleteRedisSession: ${error}`, 500);
    }
};
exports.handleDeleteRedisSession = handleDeleteRedisSession;
// WEB
// Generar sesión web en Redis
const generateRedisSessionWeb = async (sessionId, datosDelUsuario) => {
    try {
        const result = await redisClient_1.default.set(`session:${sessionId}`, JSON.stringify(datosDelUsuario), 'EX', 3600);
        if (!result) {
            throw new CustomError_1.AppError('Error al generar la sesión web en Redis', 500);
        }
        return result;
    }
    catch (error) {
        throw new CustomError_1.AppError(`Error en generateRedisSessionWeb: ${error}`, 500);
    }
};
exports.generateRedisSessionWeb = generateRedisSessionWeb;
// Obtener la sesión desde Redis
const getRedisWebSession = async (sessionId) => {
    try {
        const sessionData = await redisClient_1.default?.get(`session:${sessionId}`);
        if (!sessionData) {
            throw new CustomError_1.NotFoundError('Sesión no encontrada en Redis');
        }
        return JSON.parse(sessionData);
    }
    catch (error) {
        throw new CustomError_1.AppError(`Error en generateRedisSession: ${error}`, 500);
    }
};
exports.getRedisWebSession = getRedisWebSession;
// Actualizar la sesión web en Redis
const updateWebSession = async (sessionId, newData) => {
    try {
        let session = await (0, exports.getRedisWebSession)(sessionId);
        if (!session) {
            throw new CustomError_1.NotFoundError('Sesión no encontrada en Redis');
        }
        session = { ...session, ...newData };
        const result = await redisClient_1.default.set(`session:${sessionId}`, JSON.stringify(session), 'EX', 3600);
        if (!result) {
            throw new CustomError_1.AppError('Error al actualizar la sesión en Redis', 500);
        }
        return session;
    }
    catch (error) {
        throw new CustomError_1.AppError(`Error en updateSession: ${error}`, 500);
    }
};
exports.updateWebSession = updateWebSession;
//# sourceMappingURL=generate-redis.js.map
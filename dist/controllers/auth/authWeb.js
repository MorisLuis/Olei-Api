"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.logout = exports.renewWeb = exports.loginWeb = void 0;
const authServices_1 = require("../../services/authServices");
const CustomError_1 = require("../../errors/CustomError");
const generate_jwt_1 = require("../../helpers/generate-jwt");
const uuid_1 = require("uuid");
const generate_redis_1 = require("../../helpers/generate-redis");
const loginWeb = async (req, res, next) => {
    try {
        const { email, password } = req.body;
        const user = await (0, authServices_1.loginWebService)(email, password);
        const datosDelUsuario = {
            ...user,
            from: 'web'
        };
        // Generar un ID de sesión único
        const sessionId = (0, uuid_1.v4)();
        const token = (0, generate_jwt_1.generateAccessTokenWeb)(sessionId);
        const refreshToken = (0, generate_jwt_1.generateRefreshTokenWeb)(sessionId);
        // Guardar la sesión en Redis con expiración (1 hora)
        await (0, generate_redis_1.generateRedisSessionWeb)(sessionId, datosDelUsuario);
        // Enviar el refreshToken en cookie
        res.cookie('refreshToken', refreshToken, {
            httpOnly: true,
            secure: true,
            sameSite: 'strict',
            maxAge: 30 * 24 * 60 * 60 * 1000
        });
        return res.json({
            user: datosDelUsuario,
            token
        });
    }
    catch (error) {
        return next(error);
    }
};
exports.loginWeb = loginWeb;
const renewWeb = async (req, res, next) => {
    try {
        // Get session from REDIS.
        const userSession = req.sessionWeb;
        const sessionId = req.sessionId;
        const refreshToken = req.cookies.refreshToken;
        if (!refreshToken) {
            return res.status(401).json({ message: "No hay refresh token" });
        }
        // Guardar la sesión en Redis con expiración (1 hora)
        await (0, generate_redis_1.generateRedisSessionWeb)(sessionId, userSession);
        // Generar el token JWT que incluye el sessionId
        const newToken = (0, generate_jwt_1.generateAccessTokenWeb)(sessionId);
        const newRefreshToken = (0, generate_jwt_1.generateRefreshTokenWeb)(sessionId);
        // Enviar el refreshToken en cookie
        res.cookie('refreshToken', newRefreshToken, {
            httpOnly: true,
            secure: true,
            sameSite: 'strict',
            maxAge: 30 * 24 * 60 * 60 * 1000
        });
        return res.json({
            user: userSession,
            token: newToken
        });
    }
    catch (error) {
        return next(error);
    }
};
exports.renewWeb = renewWeb;
const logout = async (req, res, next) => {
    try {
        const sessionId = req.sessionId;
        if (!sessionId)
            throw new CustomError_1.UnauthorizedError('Sesion terminada');
        await (0, generate_redis_1.handleDeleteRedisSession)(sessionId);
        return res.json({ ok: true });
    }
    catch (error) {
        return next(error);
    }
};
exports.logout = logout;
//# sourceMappingURL=authWeb.js.map
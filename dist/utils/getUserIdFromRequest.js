"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.getUserIdFromRequest = void 0;
const redisClient_1 = __importDefault(require("../config/redisClient"));
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const getUserIdFromRequest = async (req) => {
    try {
        const authHeader = req.headers['authorization'];
        const token = authHeader?.split(' ')[1];
        if (!token)
            return null;
        const decoded = jsonwebtoken_1.default.verify(token, process.env.ACCESS_TOKEN_SECRET);
        const sessionId = decoded.sessionId;
        if (!sessionId)
            return null;
        const sessionDataRaw = await redisClient_1.default.get(`session:${sessionId}`);
        const session = sessionDataRaw ? JSON.parse(sessionDataRaw) : null;
        const user = session?.userId
            ? `${session?.IdUsuarioOLEI?.toString()}-${session?.userId?.toString()}`
            : session?.IdUsuarioOLEI
                ? `${session?.IdUsuarioOLEI?.toString()}`
                : null;
        return user;
    }
    catch (_err) {
        return null;
    }
};
exports.getUserIdFromRequest = getUserIdFromRequest;
//# sourceMappingURL=getUserIdFromRequest.js.map
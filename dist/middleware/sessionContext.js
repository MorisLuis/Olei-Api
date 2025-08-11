"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.sessionContextMiddleware = void 0;
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const asyncStorage_1 = require("../utils/asyncStorage");
const sessionContextMiddleware = (req, res, next) => {
    asyncStorage_1.asyncStorage.run(new Map(), () => {
        const authHeader = req.headers.authorization;
        const token = authHeader?.split(' ')[1];
        if (token) {
            try {
                const payload = jsonwebtoken_1.default.verify(token, process.env.JWT_SECRET || 'default-secret');
                const store = asyncStorage_1.asyncStorage.getStore();
                store?.set('dbServer', payload.ServidorSQL);
                store?.set('dbName', payload.BaseSQL);
                store?.set('userId', payload.userId);
            }
            catch (err) {
                // token inválido, no setea nada, pero no truena la app
            }
        }
        next();
    });
};
exports.sessionContextMiddleware = sessionContextMiddleware;
//# sourceMappingURL=sessionContext.js.map
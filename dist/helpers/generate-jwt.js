"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.generateWebJWT = exports.generateJWTDB = exports.generateJWT = void 0;
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const generateJWTDB = ({ IdUsuarioOLEI }) => {
    return new Promise((resolve, reject) => {
        const payload = { IdUsuarioOLEI };
        jsonwebtoken_1.default.sign(payload, process.env.SECRETORPRIVATEKEY || '', {
            expiresIn: '31536000s' // 1 year
        }, (error, token) => {
            if (error) {
                reject('No se pudo generar el token');
            }
            resolve(token);
        });
    });
};
exports.generateJWTDB = generateJWTDB;
const generateJWT = ({ Id_mobile }) => {
    return new Promise((resolve, reject) => {
        const payload = { Id_mobile };
        jsonwebtoken_1.default.sign(payload, process.env.SECRETORPRIVATEKEY || '', {
            expiresIn: process.env.JWT_EXPIRATION
        }, (error, token) => {
            if (error) {
                reject('No se pudo generar el token');
            }
            resolve(token);
        });
    });
};
exports.generateJWT = generateJWT;
const generateWebJWT = ({ Id, sessionRedis }) => {
    return new Promise((resolve, reject) => {
        const payload = { Id, sessionRedis };
        jsonwebtoken_1.default.sign(payload, process.env.SECRETORPRIVATEKEY || '', {
            expiresIn: process.env.JWT_EXPIRATION
        }, (error, token) => {
            if (error) {
                reject('No se pudo generar el token');
            }
            resolve(token);
        });
    });
};
exports.generateWebJWT = generateWebJWT;
//# sourceMappingURL=generate-jwt.js.map
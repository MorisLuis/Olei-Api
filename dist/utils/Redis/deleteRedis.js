"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.handleDeleteRedisSession = void 0;
const server_1 = require("../../models/server");
const handleDeleteRedisSession = async ({ sessionId }) => {
    await server_1.redisClient?.del(`sess:${sessionId}`, (err, response) => {
        if (err) {
            console.error('Error al eliminar la sesión:', err);
        }
        else {
            if (response === 1) {
                console.log('Sesión eliminada exitosamente');
            }
            else {
                console.log('Sesión no encontrada en Redis');
            }
        }
    });
};
exports.handleDeleteRedisSession = handleDeleteRedisSession;
//# sourceMappingURL=deleteRedis.js.map
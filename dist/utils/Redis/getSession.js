"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.handleGetWebSession = exports.handleGetSession = void 0;
const server_1 = require("../../models/server");
const handleGetSession = async ({ sessionId }) => {
    try {
        const sessionData = await server_1.redisClient?.get(`sess:${sessionId}`);
        const session = JSON.parse(sessionData);
        const user = session.user;
        return { user };
    }
    catch (error) {
        console.log({ errorGS: error });
        return { user: undefined };
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
        console.log({ errorGS: error });
        return { user: undefined };
    }
};
exports.handleGetWebSession = handleGetWebSession;
//# sourceMappingURL=getSession.js.map
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
        console.log({ error });
        return { user: undefined };
    }
};
exports.handleGetSession = handleGetSession;
const handleGetWebSession = async ({ sessionId }) => {
    try {
        const sessionData = await server_1.redisClient?.get(`sess:${sessionId}`);
        console.log({ sessionData });
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
/* export const handleGetWebSession = async ({ sessionId }: handleGetSessionInterface) => {

    try {
        const sessionData = await redisClient?.get(`sess:${sessionId}`);
        const session = JSON.parse(sessionData as string);
        const user : UserWebSessionInterface = session.userWeb;
        return { user }
    } catch (error) {
        console.log({errorGS: error})
        return { user : undefined }
    }

} */ 
//# sourceMappingURL=getSession.js.map
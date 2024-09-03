"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.handleGetSession = void 0;
const server_1 = require("../../models/server");
const handleGetSession = (_a) => __awaiter(void 0, [_a], void 0, function* ({ sessionId }) {
    console.log({ sessionId });
    try {
        const sessionData = yield (server_1.redisClient === null || server_1.redisClient === void 0 ? void 0 : server_1.redisClient.get(`sess:${sessionId}`));
        const session = JSON.parse(sessionData);
        console.log({ sessionData });
        const user = session.user;
        return { user };
    }
    catch (error) {
        console.log({ error });
        return { user: undefined };
    }
});
exports.handleGetSession = handleGetSession;
//# sourceMappingURL=getSession.js.map
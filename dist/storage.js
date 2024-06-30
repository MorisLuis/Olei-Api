"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.removeUserData = exports.setUserData = exports.getUserData = void 0;
const userStorage = {};
const getUserData = (userId) => {
    return userStorage[userId];
};
exports.getUserData = getUserData;
const setUserData = (userId, data) => {
    userStorage[userId] = data;
};
exports.setUserData = setUserData;
const removeUserData = (userId) => {
    delete userStorage[userId];
};
exports.removeUserData = removeUserData;
//# sourceMappingURL=storage.js.map
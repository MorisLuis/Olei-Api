"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.removeClienteData = exports.setClienteData = exports.getClienteData = exports.removeUserData = exports.setUserData = exports.getUserData = void 0;
const userStorage = {};
const getUserData = (userId) => {
    return userStorage[userId.toLowerCase().trim()];
};
exports.getUserData = getUserData;
const setUserData = (userId, data) => {
    userStorage[userId.toLowerCase().trim()] = data;
};
exports.setUserData = setUserData;
const removeUserData = (userId) => {
    delete userStorage[userId.toLowerCase().trim()];
};
exports.removeUserData = removeUserData;
const clientStorage = {};
const getClienteData = (clientId) => {
    return clientStorage[clientId.toLowerCase().trim()];
};
exports.getClienteData = getClienteData;
const setClienteData = (clientId, data) => {
    clientStorage[clientId.toLowerCase().trim()] = data;
};
exports.setClienteData = setClienteData;
const removeClienteData = (clientId) => {
    delete clientStorage[clientId.toLowerCase().trim()];
};
exports.removeClienteData = removeClienteData;
//# sourceMappingURL=storageApp.js.map
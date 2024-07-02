"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.removeClientData = exports.setClientData = exports.getClientData = exports.removeUserDataWeb = exports.setUserDataWeb = exports.getUserDataWeb = void 0;
const userStorage = {};
const getUserDataWeb = (userId) => {
    return userStorage[userId.toLowerCase().trim()];
};
exports.getUserDataWeb = getUserDataWeb;
const setUserDataWeb = (userId, data) => {
    userStorage[userId.toLowerCase().trim()] = data;
};
exports.setUserDataWeb = setUserDataWeb;
const removeUserDataWeb = (userId) => {
    delete userStorage[userId.toLowerCase().trim()];
};
exports.removeUserDataWeb = removeUserDataWeb;
//Client data.
const clientStorage = {};
const getClientData = (clientId) => {
    return clientStorage[clientId.toLowerCase().trim()];
};
exports.getClientData = getClientData;
// The id is like: `${baseWeb}_${Id_Cliente}`
const setClientData = (clientId, data) => {
    clientStorage[clientId.toLowerCase().trim()] = data;
};
exports.setClientData = setClientData;
const removeClientData = (clientId) => {
    delete clientStorage[clientId.toLowerCase().trim()];
};
exports.removeClientData = removeClientData;
//# sourceMappingURL=storageWeb.js.map
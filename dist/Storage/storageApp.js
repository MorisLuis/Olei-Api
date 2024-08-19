"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.removeClienteData = exports.setClienteData = exports.getClienteData = void 0;
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
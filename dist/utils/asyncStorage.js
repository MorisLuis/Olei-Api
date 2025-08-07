"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getDbInfo = exports.getContext = exports.asyncStorage = void 0;
// utils/asyncStorage.ts
const node_async_hooks_1 = require("node:async_hooks");
exports.asyncStorage = new node_async_hooks_1.AsyncLocalStorage();
const getContext = () => {
    return exports.asyncStorage.getStore();
};
exports.getContext = getContext;
const getDbInfo = () => {
    const store = (0, exports.getContext)();
    return {
        server: store?.get('dbServer'),
        database: store?.get('dbName'),
    };
};
exports.getDbInfo = getDbInfo;
//# sourceMappingURL=asyncStorage.js.map
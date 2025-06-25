"use strict";
// register.ts
Object.defineProperty(exports, "__esModule", { value: true });
exports.register = void 0;
const userService_1 = require("./userService");
const register = (name) => {
    (0, userService_1.saveUser)(name);
    return 'registered';
};
exports.register = register;
//# sourceMappingURL=register.js.map
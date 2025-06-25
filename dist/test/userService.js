"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.createUser = exports.getUserGreeting = exports.saveUser = void 0;
const userApi_1 = require("./userApi");
// userService.ts
const saveUser = (name) => {
    // aquí normalmente guardarías en la base de datos
    console.log('Saving to DB: ', name);
};
exports.saveUser = saveUser;
const getUserGreeting = async (id) => {
    const user = await (0, userApi_1.fetchUser)(id);
    return `Hola ${user.name}!`;
};
exports.getUserGreeting = getUserGreeting;
const createUser = async (name) => {
    // Aquí harías lógica DB real, por ejemplo insertar en tabla Users
    return { id: 99, name };
};
exports.createUser = createUser;
//# sourceMappingURL=userService.js.map
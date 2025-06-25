"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.fetchUser = void 0;
const fetchUser = async (id) => {
    // Simulación de llamada real – aquí harías fetch/axios/etc.
    const res = await fetch(`https://my-cool-api.io/users/${id}`);
    if (!res.ok)
        throw new Error('API fail');
    return (await res.json());
};
exports.fetchUser = fetchUser;
//# sourceMappingURL=userApi.js.map
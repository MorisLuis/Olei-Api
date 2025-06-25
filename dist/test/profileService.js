"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.deleteProfile = exports.getProfile = void 0;
const getProfile = async (id) => {
    // lógica real para buscar perfil por id
    return { id, name: 'Dummy', email: 'dummy@example.com' };
};
exports.getProfile = getProfile;
const deleteProfile = (id) => {
    // otra función...
};
exports.deleteProfile = deleteProfile;
//# sourceMappingURL=profileService.js.map
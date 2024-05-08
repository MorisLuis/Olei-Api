"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.currentTime = void 0;
const currentTime = () => {
    // Obtener la fecha actual
    const now = new Date();
    // Obtener el desplazamiento horario en minutos
    const offset = now.getTimezoneOffset();
    // Calcular el desplazamiento en milisegundos
    const offsetMilliseconds = offset * 60 * 1000;
    // Ajustar la fecha actual restando el desplazamiento
    const mexicoNow = new Date(now.getTime() - offsetMilliseconds);
    return mexicoNow;
};
exports.currentTime = currentTime;
//# sourceMappingURL=currentTime.js.map
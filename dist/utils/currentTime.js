"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.currentTime = void 0;
const moment_timezone_1 = __importDefault(require("moment-timezone"));
const currentTime = () => {
    const tz = 'America/Monterrey'; // Zona horaria deseada
    const format = "YYYY-MM-DDTHH:mm:ss.sssZ"; // Formato ISO 8601
    // Obtener la fecha y hora actual en la zona horaria deseada y formatearla
    const currentDateTime = (0, moment_timezone_1.default)().tz(tz).format(format);
    return currentDateTime;
};
exports.currentTime = currentTime;
//# sourceMappingURL=currentTime.js.map
"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.currentTime = void 0;
const moment_timezone_1 = __importDefault(require("moment-timezone"));
const currentTime = () => {
    var m = moment_timezone_1.default.utc("DD-MM-YYYY h:mm:ss A"); // parse input as UTC
    var tz = 'America/Monterrey'; // example value, you can use moment.tz.guess()
    console.log(m.clone().tz(tz).format("DD-MM-YYYY h:mm:ss")); // 30-03-2017 2:34:22 AM
    return m.clone().tz(tz).format("DD-MM-YYYY h:mm:ss");
};
exports.currentTime = currentTime;
//# sourceMappingURL=currentTime.js.map
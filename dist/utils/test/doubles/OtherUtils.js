"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.toUpperCaseWithCb = void 0;
function toUpperCaseWithCb(arg, callBack) {
    if (!arg) {
        callBack('Invalid argument!');
        return null;
    }
    callBack(`called function with ${arg}`);
    return arg.toUpperCase();
}
exports.toUpperCaseWithCb = toUpperCaseWithCb;
//# sourceMappingURL=OtherUtils.js.map
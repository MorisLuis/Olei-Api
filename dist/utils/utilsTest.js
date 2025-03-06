"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getStringInfo = exports.toUpperCase = void 0;
function toUpperCase(arg) {
    return arg.toUpperCase();
}
exports.toUpperCase = toUpperCase;
;
function getStringInfo(arg) {
    return {
        lowerCase: arg.toLowerCase(),
        upperCase: arg.toUpperCase(),
        characters: Array.from(arg),
        length: arg.length,
        extraInfo: {}
    };
}
exports.getStringInfo = getStringInfo;
//# sourceMappingURL=utilsTest.js.map
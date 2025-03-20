"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getStringInfo = exports.toUpperCase = exports.StringUitls = void 0;
class StringUitls {
    toUpperCase(arg) {
        if (!arg) {
            throw new Error("Invalid argument!");
        }
        return toUpperCase(arg);
    }
}
exports.StringUitls = StringUitls;
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
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.PasswordChecker = exports.PasswordErrorsConst = exports.NO_NUMBER = exports.NO_LOWER_CASE = exports.NO_UPPER_CASE = exports.SHORT = void 0;
exports.SHORT = 'Password is too short!';
exports.NO_UPPER_CASE = 'Upper case letter required!';
exports.NO_LOWER_CASE = 'Lower case letter required!';
exports.NO_NUMBER = 'At least one number required!';
exports.PasswordErrorsConst = { SHORT: exports.SHORT, NO_UPPER_CASE: exports.NO_UPPER_CASE, NO_LOWER_CASE: exports.NO_LOWER_CASE, NO_NUMBER: exports.NO_NUMBER };
class PasswordChecker {
    checkPassword(password) {
        const reasons = [];
        this.checkForLength(password, reasons);
        this.checkForUpperCase(password, reasons);
        this.checkForLowerCase(password, reasons);
        return {
            valid: reasons.length === 0,
            reasons
        };
    }
    checkAdminPassword(password) {
        const basicCheck = this.checkPassword(password);
        this.checkForNumber(password, basicCheck.reasons);
        return {
            valid: basicCheck.reasons.length === 0,
            reasons: basicCheck.reasons
        };
    }
    checkForNumber(password, reasons) {
        if (!/\d/.test(password)) {
            reasons.push(exports.PasswordErrorsConst.NO_NUMBER);
        }
    }
    checkForLength(password, reasons) {
        if (password.length < 8) {
            reasons.push(exports.PasswordErrorsConst.SHORT);
        }
    }
    checkForUpperCase(password, reasons) {
        if (password === password.toLowerCase()) {
            reasons.push(exports.PasswordErrorsConst.NO_UPPER_CASE);
        }
    }
    checkForLowerCase(password, reasons) {
        if (password === password.toUpperCase()) {
            reasons.push(exports.PasswordErrorsConst.NO_LOWER_CASE);
        }
    }
}
exports.PasswordChecker = PasswordChecker;
//# sourceMappingURL=PasswordChecker.js.map
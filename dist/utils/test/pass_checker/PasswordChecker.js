"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.PasswordChecker = exports.PasswordErrors = void 0;
var PasswordErrors;
(function (PasswordErrors) {
    PasswordErrors["SHORT"] = "Password is to short!";
    PasswordErrors["NO_UPPER_CASE"] = "Upper case letter required!";
    PasswordErrors["NO_LOWER_CASE"] = "Lower case letter required!";
    PasswordErrors["NO_NUMBER"] = "At least one number required!";
})(PasswordErrors || (exports.PasswordErrors = PasswordErrors = {}));
;
class PasswordChecker {
    checkPassword(password) {
        const reasons = [];
        this.checkForLength(password, reasons);
        this.checkForUpperCase(password, reasons);
        this.checkForLowerCase(password, reasons);
        return {
            valid: reasons.length > 0 ? false : true,
            reasons: reasons
        };
    }
    ;
    checkAdminPassword(password) {
        const basicCheck = this.checkPassword(password);
        this.checkForNumber(password, basicCheck.reasons);
        return {
            valid: basicCheck.reasons.length > 0 ? false : true,
            reasons: basicCheck.reasons
        };
    }
    checkForNumber(password, reasons) {
        const hasNumber = /\d/;
        if (!hasNumber.test(password)) {
            reasons.push(PasswordErrors.NO_NUMBER);
        }
    }
    checkForLength(password, reasons) {
        if (password.length < 8) {
            reasons.push(PasswordErrors.SHORT);
        }
        ;
    }
    checkForUpperCase(password, reasons) {
        if (password == password.toLowerCase()) {
            reasons.push(PasswordErrors.NO_UPPER_CASE);
        }
    }
    ;
    checkForLowerCase(password, reasons) {
        if (password == password.toUpperCase()) {
            reasons.push(PasswordErrors.NO_LOWER_CASE);
        }
    }
}
exports.PasswordChecker = PasswordChecker;
;
//# sourceMappingURL=PasswordChecker.js.map
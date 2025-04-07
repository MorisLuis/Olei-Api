export const SHORT = 'Password is too short!';
export const NO_UPPER_CASE = 'Upper case letter required!';
export const NO_LOWER_CASE = 'Lower case letter required!';
export const NO_NUMBER = 'At least one number required!';
export const PasswordErrorsConst = { SHORT, NO_UPPER_CASE, NO_LOWER_CASE, NO_NUMBER } as const;
export type PasswordErrors = typeof PasswordErrorsConst[keyof typeof PasswordErrorsConst];

export interface CheckResult {
    valid: boolean;
    reasons: PasswordErrors[];
}

export class PasswordChecker {
    public checkPassword(password: string): CheckResult {
        const reasons: PasswordErrors[] = [];
        this.checkForLength(password, reasons);
        this.checkForUpperCase(password, reasons);
        this.checkForLowerCase(password, reasons);

        return {
            valid: reasons.length === 0,
            reasons
        };
    }

    public checkAdminPassword(password: string): CheckResult {
        const basicCheck = this.checkPassword(password);
        this.checkForNumber(password, basicCheck.reasons);

        return {
            valid: basicCheck.reasons.length === 0,
            reasons: basicCheck.reasons
        };
    }

    private checkForNumber(password: string, reasons: PasswordErrors[]): void {
        if (!/\d/.test(password)) {
            reasons.push(PasswordErrorsConst.NO_NUMBER);
        }
    }

    private checkForLength(password: string, reasons: PasswordErrors[]): void {
        if (password.length < 8) {
            reasons.push(PasswordErrorsConst.SHORT);
        }
    }

    private checkForUpperCase(password: string, reasons: PasswordErrors[]): void {
        if (password === password.toLowerCase()) {
            reasons.push(PasswordErrorsConst.NO_UPPER_CASE);
        }
    }

    private checkForLowerCase(password: string, reasons: PasswordErrors[]): void {
        if (password === password.toUpperCase()) {
            reasons.push(PasswordErrorsConst.NO_LOWER_CASE);
        }
    }
}

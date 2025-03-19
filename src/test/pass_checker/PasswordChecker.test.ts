import { PasswordChecker, PasswordErrors } from "../../utils/test/pass_checker/PasswordChecker"



describe('PasswordChecker test suite', () => {

    let sut: PasswordChecker;

    beforeEach(() => {
        sut = new PasswordChecker();
    });

    it('it shoud do nothing', () => {
        sut.checkPassword('');
    });

    it('Password with less than 8 chars are invalid', () => {
        const actual = sut.checkPassword('1234567');
        expect(actual.valid).toBe(false)
        expect(actual.reasons).toContain(PasswordErrors.SHORT)
    })

    it('Password with more than 8 chars is ok', () => {
        const actual = sut.checkPassword('123456789As')
        expect(actual.valid).toBe(true);
    });

    it('Password with no upper case letter is invalid', () => {
        const actual = sut.checkPassword('1234abcd');
        expect(actual.valid).toBe(false)
        expect(actual.reasons).toContain(PasswordErrors.NO_UPPER_CASE)
    })

    it('Password with uppercase is valid', () => {
        const actual = sut.checkPassword('1234abcdA');
        expect(actual.valid).toBe(true)
    });


    it('Password with no lower case letter is invalid', () => {
        const actual = sut.checkPassword('1234ABCD');
        expect(actual.valid).toBe(false)
        expect(actual.reasons).toContain(PasswordErrors.NO_LOWER_CASE)
    });

    it('Password with lower case letter is valid', () => {
        const actual = sut.checkPassword('1234ABCd');
        expect(actual.valid).toBe(true)
    })


    it('Admin password with no number is invalid', () => {
        const actual = sut.checkAdminPassword('abcd')
        expect(actual.valid).toBe(false)
        expect(actual.reasons).toContain(PasswordErrors.NO_NUMBER);
    })

    it('Admin password with number is valid', () => {
        const actual = sut.checkAdminPassword('ABCd1234');
        expect(actual.valid).toBe(true);
    })

})
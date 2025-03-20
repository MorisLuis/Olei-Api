"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
// server.test.ts
const utilsTest_1 = require("../utils/utilsTest");
describe('Utils Test Suite', () => {
    describe.only('StringUtils tests', () => {
        let sut;
        beforeEach(() => {
            sut = new utilsTest_1.StringUitls;
            console.log("setup");
        });
        afterAll(() => {
            console.log("Teardown");
        });
        it('Should return correct uppercase', () => {
            const actual = sut.toUpperCase('abc');
            expect(actual).toBe('ABC');
            console.log("actual test");
        });
        it('Should throw error on invalid argument - function', () => {
            function expectError() {
                return sut.toUpperCase('');
            }
            ;
            expect(expectError).toThrow();
            expect(expectError).toThrowError('Invalid argument!');
        });
        it.only('Should throw error on invalid argument - arrow function', () => {
            expect(() => sut.toUpperCase('')).toThrowError('Invalid argument!');
        });
    });
    it('should return uppercase', () => {
        // arrange:
        // Configuración de lo necesario para la prueba, incluye:
        // - Inicializacion de variables.
        // - Creacion de instancias de objetos
        // - Configuración de mocks.
        // La idea es preparar el escenario para que la prueba tenga un contexto controlado
        const sut = utilsTest_1.toUpperCase;
        const expected = 'ABC';
        // act:
        // Aqui ejecutas la funcion o el bloque de codigo que deseas probar.
        // Es importante que esta seccion se limite a una acciôn concreta para que, en caso de fallo, sea mas
        // facil identificar qué parte del codigo está generando el error.
        const actual = sut('abc');
        // assert ( Verificación ):
        // En esta ultima fase se verifica que el resultado obtenido coincida con el resultado esperado.
        expect(actual).toBe(expected);
    });
    describe('getStringInfo for arg My-String should', () => {
        test('return right length', () => {
            const actual = (0, utilsTest_1.getStringInfo)('My-String');
            expect(actual.characters.length).toBe(9);
            expect(actual.characters).toHaveLength(9);
        });
        test('return right lower case', () => {
            const actual = (0, utilsTest_1.getStringInfo)('My-String');
            expect(actual.lowerCase).toBe('my-string');
        });
        test('return right upper case', () => {
            const actual = (0, utilsTest_1.getStringInfo)('My-String');
            expect(actual.upperCase).toBe('MY-STRING');
        });
        test('return right characters', () => {
            const actual = (0, utilsTest_1.getStringInfo)('My-String');
            expect(actual.characters).toEqual(['M', 'y', '-', 'S', 't', 'r', 'i', 'n', 'g']);
            expect(actual.characters).toContain('M');
            expect(actual.characters).toEqual(expect.arrayContaining(['S', 't', 'r', 'i', 'n', 'g', 'M', 'y', '-']));
        });
        test('return defined extra info', () => {
            const actual = (0, utilsTest_1.getStringInfo)('My-String');
            expect(actual.extraInfo).not.toBe(undefined);
            expect(actual.extraInfo).toBeDefined();
            expect(actual.extraInfo).not.toBeUndefined();
            expect(actual.extraInfo).toBeTruthy();
        });
        test('return right extra info', () => {
            const actual = (0, utilsTest_1.getStringInfo)('My-String');
            expect(actual.extraInfo).toEqual({});
        });
    });
    // Parametrized tests.
    describe('ToUpperCase examples', () => {
        it.each([
            { input: 'abc', expected: 'ABC' },
            { input: 'My-String', expected: 'MY-STRING' },
            { input: 'def', expected: 'DEF' }
        ])('$input toUpperCase should be $expected', ({ input, expected }) => {
            const actual = (0, utilsTest_1.toUpperCase)(input);
            expect(actual).toBe(expected);
        });
    });
});
//# sourceMappingURL=Utils.test.js.map
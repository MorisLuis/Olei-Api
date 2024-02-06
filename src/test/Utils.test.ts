import { toUpperCae } from "../Utils"

describe('Utils test suite', () => {
    test('should return uppercase', () => {
        const result = toUpperCae('abc');
        expect(result).toBe('ABC')
    })
})
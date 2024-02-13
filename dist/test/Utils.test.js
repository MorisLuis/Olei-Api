"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const Utils_1 = require("../Utils");
describe('Utils test suite', () => {
    test('should return uppercase', () => {
        const result = (0, Utils_1.toUpperCae)('abc');
        expect(result).toBe('ABC');
    });
});
//# sourceMappingURL=Utils.test.js.map
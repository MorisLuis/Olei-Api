"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const config = {
    preset: 'ts-jest',
    testEnvironment: 'node',
    verbose: true,
    collectCoverage: true,
    collectCoverageFrom: [
        '<rootDir>/src/**/*.ts'
    ]
};
exports.default = config;
//# sourceMappingURL=jest.config.js.map
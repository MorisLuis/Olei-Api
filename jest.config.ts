import type { Config } from "jest";

const config: Config = {
    preset: "ts-jest",
    testEnvironment: "node",
    rootDir: "./",
    testMatch: [
        "**/__tests__/**/*.test.ts",
        "**/__tests__/**/*.int.test.ts"
    ],
    moduleDirectories: ["node_modules", "src"],
    moduleFileExtensions: ["ts", "js", "json"],
    setupFilesAfterEnv: ["<rootDir>/__tests__/setup/jest.setup.ts"],
    transform: {
        "^.+\\.ts$": ["ts-jest", {
            tsconfig: "tsconfig.json"
        }]
    },
    verbose: true,
    clearMocks: true,
    resetMocks: true,
    automock: false,
    collectCoverageFrom: [
        "src/**/*.ts",
        "!src/**/*.d.ts",
        "!src/index.ts"
    ]
};

export default config;
"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
// server.test.ts
const supertest_1 = __importDefault(require("supertest"));
const __1 = __importDefault(require(".."));
const request = (0, supertest_1.default)(__1.default.app);
describe('User Controller Test Suite', () => {
    test('should get users and respond with status 200', async () => {
        const response = await request.get('/api/user');
        expect(response.status).toBe(200);
        expect(response.body).toHaveProperty('total');
        expect(response.body).toHaveProperty('users');
    });
});
//# sourceMappingURL=Utils.test.js.map
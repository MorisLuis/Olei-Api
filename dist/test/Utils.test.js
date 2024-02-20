"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
// server.test.ts
const supertest_1 = __importDefault(require("supertest"));
const __1 = __importDefault(require(".."));
const request = (0, supertest_1.default)(__1.default.app);
//const request = supertest(server.app);
describe('Server test suite', () => {
    test('should respond with status 200 for the root endpoint', () => __awaiter(void 0, void 0, void 0, function* () {
        const response = yield request.get('/api/user');
        expect(response.status).toBe(200);
    }));
    test('should respond with status 404 for an unknown endpoint', () => __awaiter(void 0, void 0, void 0, function* () {
        const response = yield request.get('/unknown');
        expect(response.status).toBe(404);
    }));
});
//# sourceMappingURL=Utils.test.js.map
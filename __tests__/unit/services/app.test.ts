// __tests__/integration/app.test.ts
import request from 'supertest';
import app from '../../../src/test/app';
import * as userService from '../../../src/test/userService'

describe('POST /api/users', () => {

    beforeEach(() => {
        jest.restoreAllMocks(); // limpia mocks antes de cada test
    });

    it('should create user and respond with 201 + user object (mocked)', async () => {
        jest.spyOn(userService, 'createUser').mockResolvedValue({ id: 42, name: "Morado" })

        const res = await request(app).post('/api/users').send({ name: 'Morado' });
        expect(res.statusCode).toBe(201);
        expect(res.body).toEqual({ id: 42, name: "Morado" })
    });

    it('should respond 400 if name is missing', async () => {
        const res = await request(app).post('/api/users').send({});

        expect(res.statusCode).toBe(400);
        expect(res.body).toEqual({ error: 'Name is required and must be a string' });
    });

    it('hould handle service errors gracefully', async () => {
        jest.spyOn(userService, 'createUser').mockRejectedValue(new Error('DB fail'));
        const res = await request(app).post('/api/users').send({ name: 'luis' });

        expect(res.statusCode).toBe(500);
        expect(res.body).toEqual({ error: 'Internal Server Error' });
    });

});

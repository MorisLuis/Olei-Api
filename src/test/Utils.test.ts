// server.test.ts
import supertest from 'supertest';
import server from '..';
import { dbConnection } from '../database';

const request = supertest(server.app);

describe('User Controller Test Suite', () => {

    test('should get users and respond with status 200', async () => {
        const response = await request.get('/api/user');
        expect(response.status).toBe(200);
        expect(response.body).toHaveProperty('total');
        expect(response.body).toHaveProperty('users');
    });
});
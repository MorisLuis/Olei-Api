import request from 'supertest';
import jwt from 'jsonwebtoken';
import app from '../../../src/test/app';
import * as profileService from '../../../src/test/profileService';

process.env.JWT_SECRET = 'access_secret';
const generateToken = (payload: object) => jwt.sign(payload, 'access_secret');

describe('GET /api/profile - protected route', () => {
    beforeEach(() => jest.restoreAllMocks());

    it('should reject request without token', async () => {
        const res = await request(app).get('/api/profile');
        expect(res.statusCode).toBe(401);
        expect(res.body).toEqual({ error: 'No token' });
    });

    it('should return user profile on valid token', async () => {
        // Simulamos respuesta del servicio
        jest.spyOn(profileService, 'getProfile').mockResolvedValue({
            id: 1,
            name: 'Morado',
            email: 'morado@example.com',
        });

        const token = generateToken({ id: 1 });
        const res = await request(app)
            .get('/api/profile')
            .set('Authorization', `Bearer ${token}`);

        expect(profileService.getProfile).toHaveBeenCalledWith(1);
        expect(res.statusCode).toBe(200);
        expect(res.body).toEqual({
            id: 1,
            name: 'Morado',
            email: 'morado@example.com',
        });
    });

})
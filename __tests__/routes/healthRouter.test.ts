import express from 'express';
import request from 'supertest';

import healthRouter from '../../src/routes/healthRouter';
import { isReady } from '../../src/services/health/health.service';

jest.mock('../../src/services/health/health.service', () => ({
    isReady: jest.fn(),
}));

const isReadyMock = isReady as jest.MockedFunction<typeof isReady>;

describe('health routes', () => {
    const app = express();
    app.use('/health', healthRouter);

    beforeEach(() => {
        jest.clearAllMocks();
    });

    it('exposes liveness without authentication', async () => {
        const response = await request(app).get('/health/live');

        expect(response.status).toBe(200);
        expect(response.body.data).toEqual({ status: 'live' });
    });

    it('exposes ready state without authentication', async () => {
        isReadyMock.mockReturnValue(true);

        const response = await request(app).get('/health/ready');

        expect(response.status).toBe(200);
        expect(response.body.data).toEqual({ status: 'ready' });
    });

    it('returns 503 when the application is unready', async () => {
        isReadyMock.mockReturnValue(false);

        const response = await request(app).get('/health/ready');

        expect(response.status).toBe(503);
        expect(response.body).toEqual({
            success: false,
            error: {
                code: 503,
                message: 'Service unavailable',
                resource: 'readiness',
            },
        });
    });
});

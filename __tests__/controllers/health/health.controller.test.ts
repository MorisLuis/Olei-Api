import type { Request, Response } from 'express';

import { getLiveness, getReadiness } from '../../../src/controllers/health/health.controller';
import { isReady } from '../../../src/services/health/health.service';

jest.mock('../../../src/services/health/health.service', () => ({
    isReady: jest.fn(),
}));

const isReadyMock = isReady as jest.MockedFunction<typeof isReady>;

const createResponse = (): Response => {
    const response = {
        status: jest.fn(),
        json: jest.fn(),
    } as unknown as Response;
    (response.status as unknown as jest.Mock).mockReturnValue(response);
    return response;
};

describe('health controller', () => {
    const request = {} as Request;

    beforeEach(() => {
        jest.clearAllMocks();
    });

    it('reports liveness without checking dependencies', () => {
        const response = createResponse();

        getLiveness(request, response);

        expect(isReadyMock).not.toHaveBeenCalled();
        expect(response.status).toHaveBeenCalledWith(200);
        expect(response.json).toHaveBeenCalledWith({
            success: true,
            message: 'Operation successful',
            data: { status: 'live' },
            info: undefined,
        });
    });

    it('reports readiness without dependency details', () => {
        const response = createResponse();
        isReadyMock.mockReturnValue(true);

        getReadiness(request, response);

        expect(response.status).toHaveBeenCalledWith(200);
        expect(response.json).toHaveBeenCalledWith({
            success: true,
            message: 'Operation successful',
            data: { status: 'ready' },
            info: undefined,
        });
    });

    it('returns 503 without exposing the failed dependency', () => {
        const response = createResponse();
        isReadyMock.mockReturnValue(false);

        getReadiness(request, response);

        expect(response.status).toHaveBeenCalledWith(503);
        expect(response.json).toHaveBeenCalledWith({
            success: false,
            error: {
                code: 503,
                message: 'Service unavailable',
                resource: 'readiness',
            },
        });
        expect(JSON.stringify((response.json as unknown as jest.Mock).mock.calls)).not.toMatch(/sql|redis/i);
    });
});

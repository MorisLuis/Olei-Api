import { isReady, markNotReady, markReady } from '../../../src/services/health/health.service';

const dependencies = (databaseConnected: boolean, redisReady: boolean) => ({
    isDatabaseConnected: jest.fn(() => databaseConnected),
    isRedisReady: jest.fn(() => redisReady),
});

describe('health service', () => {
    beforeEach(() => {
        markNotReady();
    });

    it('is not ready before lifecycle startup completes', () => {
        const checks = dependencies(true, true);

        expect(isReady(checks)).toBe(false);
        expect(checks.isDatabaseConnected).not.toHaveBeenCalled();
        expect(checks.isRedisReady).not.toHaveBeenCalled();
    });

    it('is ready when lifecycle, SQL and Redis are ready', () => {
        markReady();

        expect(isReady(dependencies(true, true))).toBe(true);
    });

    it('is not ready when SQL is disconnected', () => {
        markReady();

        expect(isReady(dependencies(false, true))).toBe(false);
    });

    it('is not ready when Redis is disconnected', () => {
        markReady();

        expect(isReady(dependencies(true, false))).toBe(false);
    });

    it('becomes unready when lifecycle shutdown begins', () => {
        markReady();
        markNotReady();

        expect(isReady(dependencies(true, true))).toBe(false);
    });
});

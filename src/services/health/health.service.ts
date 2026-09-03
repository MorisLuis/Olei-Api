import redisClient from '../../config/redisClient';
import { getMainPool } from '../../database/connection/dbConnectionMain';

interface ReadinessDependencies {
    isDatabaseConnected: () => boolean;
    isRedisReady: () => boolean;
}

const defaultDependencies: ReadinessDependencies = {
    isDatabaseConnected: () => getMainPool()?.connected === true,
    isRedisReady: () => redisClient.status === 'ready',
};

let lifecycleReady = false;

export const markReady = (): void => {
    lifecycleReady = true;
};

export const markNotReady = (): void => {
    lifecycleReady = false;
};

export const isReady = (dependencies: ReadinessDependencies = defaultDependencies): boolean =>
    lifecycleReady && dependencies.isDatabaseConnected() && dependencies.isRedisReady();

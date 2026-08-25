/// <reference path="./types/express-session.d.ts" />

import { bootstrap } from './bootstrap';
import { logger } from './helpers/logger';

void bootstrap().catch(() => {
    logger.error('application.startup_failed');
    process.exitCode = 1;
});

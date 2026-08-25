/// <reference path="./types/express-session.d.ts" />

import { bootstrap } from './bootstrap';

void bootstrap().catch(() => {
    console.error('Application startup failed');
    process.exitCode = 1;
});

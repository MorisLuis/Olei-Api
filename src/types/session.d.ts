// src/types/session.d.ts

import 'express-session';
import { UserSessionInterface, UserWebSessionInterface } from '../interface/user';

declare module 'express-session' {
    interface SessionData {
        user?: UserSessionInterface;
        userWeb?: UserWebSessionInterface;
    }
}

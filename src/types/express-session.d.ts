
import type { UserSessionInterface, UserWebSessionInterface } from '../interface/user';

declare module 'express-session' {
    interface SessionData {
        user: UserSessionInterface;
        userWeb: UserWebSessionInterface;
    }
}

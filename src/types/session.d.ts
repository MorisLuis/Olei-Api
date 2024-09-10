// src/types/session.d.ts

import session from 'express-session';
import { UserSessionInterface, UserWebSessionInterface } from '../interface/user';

declare module 'express' {
    interface Request {
        session: session.Session & Partial<session.SessionData>;
    }
}

declare module 'express-session' {
    export interface ISession extends Session {
        user: UserSessionInterface,
        userWeb: UserWebSessionInterface
    }
}

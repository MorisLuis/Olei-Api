import session from "express-session";

export = session;

declare module 'express-session' {
    export interface SessionData {
        user?: UserSessionInterface; // Define aquí el tipo correcto para tu propiedad 'user'
    }
}

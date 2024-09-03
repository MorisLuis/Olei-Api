// src/types/session.d.ts
import session from "express-session";
import { UserSessionInterface } from "../interface/user";

declare module "express-session" {
    interface SessionData {
        user?: UserSessionInterface
    }
}

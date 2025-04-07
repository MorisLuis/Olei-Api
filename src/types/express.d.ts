import type { Request } from 'express';


import type { UserSessionInterface, UserWebSessionInterface } from '../interface/user';

declare global {
  namespace Express {
    interface Request {
      sessionId: string;
      session: UserSessionInterface;
      sessionWeb: UserWebSessionInterface;
    }
  }
}

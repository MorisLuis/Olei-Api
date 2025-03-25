import { Request } from 'express';
import { UserSessionInterface, UserWebSessionInterface } from '../interface/user';

declare global {
  namespace Express {
    interface Request {
      IdUsuarioOLEI: string; //Id for database login
      Id_mobile: string; //Id for user login
      sessionId: string;
      session: UserSessionInterface;
      sessionWeb: UserWebSessionInterface;
    
      // web properties
      Id_web: string; //Id for user login
      sessionRedis: string; // sessionID
    }
  }
}

import { Request } from 'express';

declare global {
  namespace Express {
    interface Request {
      IdUsuarioOLEI: string; //Id for database login
      id: string; //Id for user login

      // web properties
      Id: string; //Id for user login
      sessionRedis: string; //sessionID
    }
  }
}

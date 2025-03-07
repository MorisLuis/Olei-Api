import { Request } from 'express';

declare global {
  namespace Express {
    interface Request {
      IdUsuarioOLEI: string; //Id for database login
      Id_mobile: string; //Id for user login

      // web properties
      Id_web: string; //Id for user login
      sessionRedis: string; // sessionID
    }
  }
}

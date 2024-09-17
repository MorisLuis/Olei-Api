import { Request } from 'express';

declare global {
  namespace Express {
    interface Request {
      IdUsuarioOLEI: string;
      id: string;

      // web properties
      Id: string;
      sessionRedis: string

    }
  }
}

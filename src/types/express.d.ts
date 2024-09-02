import { Request } from 'express';

declare global {
  namespace Express {
    interface Request {
      IdUsuarioOLEI: string;

      // web properties
      id: string;
      rol: number;
      serverweb: string;
      baseweb: string;
      clientid: number;
    }
  }
}

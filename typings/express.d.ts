import { Request } from 'express';

declare global {
  namespace Express {
    interface Request {
      //app properties
      serverclientes: string;
      baseclientes: string;
      server: string;
      base: string;

      IdUsuarioOLEI: string;
      id: string;
      rol: number;

      // web properties
      serverweb: string;
      baseweb: string;
      clientid: number;
    }
  }
}

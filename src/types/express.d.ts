import { Request } from 'express';

declare global {
  namespace Express {
    interface Request {
      IdUsuarioOLEI: string;

      //app properties
/*       serverclientes: string;
      baseclientes: string;
      server: string;
      base: string;

      IdUsuarioOLEI: string;
      id: string;
      rol: number;
 */
      // web properties
      id: string;
      rol: number;
      serverweb: string;
      baseweb: string;
      clientid: number;
    }
  }
}

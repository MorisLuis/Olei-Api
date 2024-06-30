import { Request } from 'express';

declare global {
  namespace Express {
    interface Request {
      serverclientes: string;
      baseclientes: string;
      IdUsuarioOLEI: string;
      server: string;
      base: string;
      id: string;
      rol: number;
      // Puedes añadir más propiedades si es necesario
    }
  }
}

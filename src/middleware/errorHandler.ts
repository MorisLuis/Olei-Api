 /* eslint-disable no-undef */

import { Request, Response } from "express";
import { handleErrorsEndpoint } from "../controllers/errors";

interface ErrorResponse extends Error {
  statusCode?: number;
}
const errorHandler = async (err: ErrorResponse, req: Request, res: Response): Promise<void> => {

  const statusCode = err.statusCode || 500;
  const message = err.message || 'Internal Server Error';
  const Id_Usuario = req.Id_mobile ?? req.IdUsuarioOLEI ?? req.Id_web ?? "Sin Usuario";

  console.error(`[ERROR] ${req.method} ${req.path} - ${message}`);

  // Intentamos guardar el error en la base de datos
  try {
    await handleErrorsEndpoint({
      From: req.path,                    // O el nombre del módulo o componente donde ocurrió el error
      Message: message,                  // Mensaje de error
      Id_Usuario: Id_Usuario,  // O extraerlo de la sesión, si lo tienes
      Metodo: req.method,                // Método HTTP
      code: statusCode.toString()        // Código de error convertido a string
    });
  } catch (loggingError) {
    console.error('Error guardando log en la DB:', loggingError);
  }

  res.status(statusCode).json({ error: message });
};

export { errorHandler };

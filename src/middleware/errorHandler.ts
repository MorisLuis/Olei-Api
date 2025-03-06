import { NextFunction, Request, Response } from "express";

interface ErrorResponse extends Error {
  statusCode?: number;
}

interface errorHandlerInterface {
  err: ErrorResponse,
  req: Request,
  res: Response,
  next: NextFunction
}

const errorHandler = (err: ErrorResponse, req: Request, res: Response, next: NextFunction): void => {
  const statusCode = err.statusCode || 500;
  const message = err.message || 'Internal Server Error';

  console.error(`[ERROR] ${req.method} ${req.path} - ${message}`);
  res.status(statusCode).json({ error: message });
};


export { errorHandler };

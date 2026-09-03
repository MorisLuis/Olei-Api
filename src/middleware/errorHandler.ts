import { ZodError } from "zod";

import type { NextFunction, Request, Response } from "express";
import type { ErrorResponse } from "./types";
import { logger } from '../helpers/logger';

const errorHandler = (
  err: ErrorResponse,
  req: Request,
  res: Response,
  _next: NextFunction
): void => {

  void _next;

  if (err instanceof ZodError) {
    const errors = err.issues.map(issue => ({
      field: issue.path.join("."),
      message: issue.message,
      code: issue.code,
    }));

    logger.warn('http.validation_failed', {
      method: req.method,
      route: typeof req.route?.path === 'string' ? req.route.path : 'unmatched',
      statusCode: 400,
      issueCount: errors.length,
    });

    res.status(400).json({
      ok: false,
      message: "Validation failed",
      statusCode: 400,
      debugMessage: null,
      errors,
    });

    return;
  }

  const statusCode = err.statusCode || 500;
  const message = err.message || "Internal server error";
  const debugMessage = err.debugMessage ?? null;
  const code = err.code ?? null;

  //TODO: Stored the erro in the database for further analysis and debugging.

  logger.error('http.request_failed', {
    method: req.method,
    route: typeof req.route?.path === 'string' ? req.route.path : 'unmatched',
    statusCode,
    code,
  });
  res.status(statusCode).json({
    message,
    statusCode,
    debugMessage,
    code
  });
};

export { errorHandler };

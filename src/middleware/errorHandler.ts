import { ZodError } from "zod";

import type { NextFunction, Request, Response } from "express";
import type { ErrorResponse } from "./types";

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

    console.error(`[VALIDATION ERROR] ${req.method} ${req.path}`, errors);

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

  console.error(`[ERROR] ${req.method} ${req.path} - ${message}`);
  res.status(statusCode).json({
    message,
    statusCode,
    debugMessage,
    code
  });
};

export { errorHandler };

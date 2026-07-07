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
      errors,
    });

    return;
  }

  const statusCode = err.statusCode || 500;
  const message = statusCode >= 500 ? "Internal server error" : err.message;

  //TODO: Stored the erro in the database for further analysis and debugging.

  console.error(`[ERROR] ${req.method} ${req.path} - ${message}`);
  res.status(statusCode).json({ error: message });
};

export { errorHandler };

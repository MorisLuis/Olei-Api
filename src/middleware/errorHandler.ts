import { NextFunction, Request, Response } from "express";
import { CustomError } from "../errors/CustomError";

export const errorHandler = (
  err: Error,
  req: Request,
  res: Response,
  next: NextFunction
): void => {
  // Errores controlados (personalizados)
  if (err instanceof CustomError) {
    const { statusCode, errors } = err;

    console.error("Error: ========================================");
    console.error(
      JSON.stringify(
        {
          code: statusCode,
          errors,
          stack: err.stack,
        },
        null,
        2
      )
    );

    res.status(statusCode).json({
      errors,
      message: err.message,
    });
    return; // Finaliza la función sin devolver nada
  }

  // Errores no controlados
  console.error("Unhandled error:", JSON.stringify(err, null, 2));
  res.status(500).json({
    errors: [{ message: "Something went wrong" }],
    message: "Something went wrong",
  });
};

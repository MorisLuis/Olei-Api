"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.errorHandler = void 0;
const CustomError_1 = require("../errors/CustomError");
const errorHandler = (err, req, res, next) => {
    // Errores controlados (personalizados)
    if (err instanceof CustomError_1.CustomError) {
        const { statusCode, errors, logging } = err;
        if (logging) {
            console.error("Error: ========================================");
            console.error(JSON.stringify({
                code: statusCode,
                errors,
                stack: err.stack,
            }, null, 2));
            console.error("Fin Error: =====================================");
        }
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
exports.errorHandler = errorHandler;
//# sourceMappingURL=errorHandler.js.map
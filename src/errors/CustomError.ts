export type CustomErrorContent = {
    message: string,
    context?: { [key: string]: any }
};

export abstract class CustomError extends Error {
    abstract readonly statusCode: number;
    abstract readonly errors: CustomErrorContent[];
    abstract readonly logging: boolean;

    constructor(message: string) {
        super(message);
        // Solo porque estamos extendiendo una clase built-in
        Object.setPrototypeOf(this, CustomError.prototype);
    }

    // Método opcional para estandarizar la salida de errores
    serializeErrors(): CustomErrorContent[] {
        return this.errors;
    }
}

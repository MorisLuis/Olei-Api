// Clase base para todos los errores personalizados
export class CustomError extends Error {
	public statusCode: number
	public errorType: string
	public resource?: string
	public database_code?: string
	public sql?: string
	public errors?: unknown
	public uuid?: string

	constructor(
		message: string,
		statusCode: number,
		errorType: string,
		resource?: string,
		database_code?: string,
		sql?: string,
		uuid?: string
	) {
		super(message)
		this.statusCode = statusCode
		this.errorType = errorType
		this.resource = resource
		this.database_code = database_code
		this.sql = sql
		this.uuid = uuid
		Error.captureStackTrace(this, this.constructor)
	}
}

// Error para fallos de autenticación
export class AuthError extends CustomError {
	constructor(message = "Authentication failed", statusCode = 401) {
		super(message, statusCode, "AUTHENTICATION_ERROR")
	}
}

// Error cuando un recurso no se encuentra
export class NotFoundError extends CustomError {
	constructor(message = "Resource", path = "") {
		super(message, 404, "NOT_FOUND_ERROR", path)
	}
}

// Error cuando falla la creación de un recurso
export class CreationError extends CustomError {
	constructor(message = "Failed to create", resource = "Resource") {
		super(message, 400, "CREATION_ERROR", `Failed to create "${resource}"`)
	}
}

export class MissingParametersError extends CustomError {
	constructor(message = "Missing parameters", resource = "Resource") {
		super(message, 400, "MISSING_PARAMETERS", `Missing parameters for "${resource}"`)
	}
}

export class MailError extends CustomError {
	constructor(message = "Mail error", resource = "Mail") {
		super(message, 400, "MAIL_ERROR", `Mail error for "${resource}"`)
	}
}

// Error de base de datos
interface DatabaseErrorInput {
	parent?: {
		message?: string;
		code?: string;
		sql?: string;
	};
	message?: string;
}

export class DatabaseError extends CustomError {
	constructor(error: DatabaseErrorInput) {
		const message = error.parent?.message || error.message || 'Unknown database error'
		const code = error.parent?.code
		const sql = error.parent?.sql

		super(message, 500, "DATABASE_ERROR", undefined, code, sql)
	}
}